var constants = require('../constants');
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');
var bind = utils.bind;

var EVENTS = {
  CLICK: 'click',
  FUSING: 'fusing',
  MOUSEENTER: 'mouseenter',
  MOUSEDOWN: 'mousedown',
  MOUSELEAVE: 'mouseleave',
  MOUSEUP: 'mouseup'
};

var STATES = {
  FUSING: 'cursor-fusing',
  HOVERING: 'cursor-hovering',
  HOVERED: 'cursor-hovered'
};

/**
 * Cursor component. Applies the raycaster component specifically for starting the raycaster
 * from the camera and pointing from camera's facing direction, and then only returning the
 * closest intersection. Cursor can be fine-tuned by setting raycaster properties.
 *
 * @member {object} fuseTimeout - Timeout to trigger fuse-click.
 * @member {Element} mouseDownEl - Entity that was last mousedowned during current click.
 * @member {object} intersection - Attributes of the current intersection event, including
 *         3D- and 2D-space coordinates. See: http://threejs.org/docs/api/core/Raycaster.html
 * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
 *         emit events when unintersecting.
 */
module.exports.Component = registerComponent('cursor', {
  dependencies: ['raycaster'],

  schema: {
    fuse: {default: utils.device.isMobile()},
    fuseTimeout: {default: 1500, min: 0},
    projectionEnabled: {default: false},
    projectionMixin: {default: ''}
  },

  init: function () {
    var el = this.el;
    var canvas = el.sceneEl.canvas;
    var raycasterData;

    this.fuseTimeout = undefined;
    this.mouseDownEl = null;
    this.intersection = null;
    this.intersectedEl = null;

    // Wait for canvas to load.
    if (!canvas) {
      el.sceneEl.addEventListener('render-target-loaded', bind(this.init, this));
      return;
    }

    // Bind methods.
    this.onMouseDown = bind(this.onMouseDown, this);
    this.onMouseUp = bind(this.onMouseUp, this);
    this.onIntersection = bind(this.onIntersection, this);
    this.onIntersectionCleared = bind(this.onIntersectionCleared, this);

    if (this.data.projectionEnabled) {
      this.injectProjectionEl();
      // If projection enabled, speed up interval so mesh position updates are smooth.
      raycasterData = el.getDOMAttribute('raycaster');
      if (!raycasterData || !('interval' in raycasterData)) {
        el.setAttribute('raycaster', 'interval', 15);
      }
    }

    // Attach event listeners.
    canvas.addEventListener('mousedown', this.onMouseDown);
    canvas.addEventListener('mouseup', this.onMouseUp);
    el.addEventListener('raycaster-intersection', this.onIntersection);
    el.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
  },

  tick: function (t) {
    if (this.data.projectionEnabled) { this.drawProjection(); }
  },

  remove: function () {
    var el = this.el;
    var canvas = el.sceneEl.canvas;

    el.removeState(STATES.HOVERING);
    el.removeState(STATES.FUSING);
    el.removeEventListener('raycaster-intersection', this.onIntersection);
    el.removeEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);

    clearTimeout(this.fuseTimeout);

    if (this.intersectedEl) { this.intersectedEl.removeState(STATES.HOVERED); }

    if (canvas) {
      canvas.removeEventListener('mousedown', this.onMouseDown);
      canvas.removeEventListener('mouseup', this.onMouseUp);
    }
  },

  /**
   * Trigger mousedown and keep track of the mousedowned entity.
   */
  onMouseDown: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEDOWN);
    this.mouseDownEl = this.intersectedEl;
  },

  /**
   * Trigger mouseup if:
   * - Not fusing (mobile has no mouse).
   * - Currently intersecting an entity.
   * - Currently-intersected entity is the same as the one when mousedown was triggered,
   *   in case user mousedowned one entity, dragged to another, and mouseupped.
   */
  onMouseUp: function (evt) {
    this.twoWayEmit(EVENTS.MOUSEUP);
    if (this.data.fuse || !this.intersectedEl ||
        this.mouseDownEl !== this.intersectedEl) { return; }
    this.twoWayEmit(EVENTS.CLICK);
  },

  /**
   * Handle intersection.
   */
  onIntersection: function (evt) {
    var self = this;
    var cursorEl = this.el;
    var data = this.data;
    var index;
    var intersectedEl;
    var intersection;

    // Select closest object, excluding the cursor.
    index = evt.detail.els[0] === cursorEl ? 1 : 0;
    intersection = evt.detail.intersections[index];
    intersectedEl = evt.detail.els[index];

    // If cursor is the only intersected object, ignore the event.
    if (!intersectedEl) { return; }

    // Already intersecting this entity.
    if (this.intersectedEl === intersectedEl) {
      this.intersection = intersection;
      return;
    }

    // Unset current intersection.
    if (this.intersectedEl) { this.clearCurrentIntersection(); }

    // Set new intersection.
    this.intersection = intersection;
    this.intersectedEl = intersectedEl;

    // Hovering.
    cursorEl.addState(STATES.HOVERING);
    intersectedEl.addState(STATES.HOVERED);
    self.twoWayEmit(EVENTS.MOUSEENTER);

    // Begin fuse if necessary.
    if (data.fuseTimeout === 0 || !data.fuse) { return; }
    cursorEl.addState(STATES.FUSING);
    this.twoWayEmit(EVENTS.FUSING);
    this.fuseTimeout = setTimeout(function fuse () {
      cursorEl.removeState(STATES.FUSING);
      self.twoWayEmit(EVENTS.CLICK);
    }, data.fuseTimeout);
  },

  /**
   * Handle intersection cleared.
   */
  onIntersectionCleared: function (evt) {
    var cursorEl = this.el;
    var intersectedEl = evt.detail.el;

    // Ignore the cursor.
    if (cursorEl === intersectedEl) { return; }

    // Ignore if the event didn't occur on the current intersection.
    if (intersectedEl !== this.intersectedEl) { return; }

    this.clearCurrentIntersection();
  },

  clearCurrentIntersection: function () {
    var cursorEl = this.el;

    // No longer hovering (or fusing).
    this.intersectedEl.removeState(STATES.HOVERED);
    cursorEl.removeState(STATES.HOVERING);
    cursorEl.removeState(STATES.FUSING);
    this.twoWayEmit(EVENTS.MOUSELEAVE);

    // Unset intersected entity (after emitting the event).
    this.intersection = null;
    this.intersectedEl = null;

    // Clear fuseTimeout.
    clearTimeout(this.fuseTimeout);
  },

  /**
   * Helper to emit on both the cursor and the intersected entity (if exists).
   */
  twoWayEmit: function (evtName) {
    var el = this.el;
    var intersectedEl = this.intersectedEl;
    var intersection = this.intersection;
    el.emit(evtName, {intersectedEl: intersectedEl, intersection: intersection});
    if (!intersectedEl) { return; }
    intersectedEl.emit(evtName, {cursorEl: el, intersection: intersection});
  },

/**
   * Create mesh to project on intersection point.
   */
  injectProjectionEl: function () {
    var data = this.data;
    var projectionEl = this.projectionEl = document.createElement('a-entity');
    if (data.projectionMixin) {
      // Create from mixin.
      projectionEl.setAttribute('mixin', data.projectionMixin);
    } else {
      // Create from default.
      projectionEl.setAttribute('geometry', {
        primitive: 'ring',
        radiusInner: 0.06,
        radiusOuter: 0.2
      });
      projectionEl.setAttribute('material', {
        color: 'lightblue',
        opacity: 0.75
      });
    }
    projectionEl.setAttribute(constants.AFRAME_INJECTED, 'cursor-projection');
    this.el.sceneEl.appendChild(projectionEl);
  },

  /**
   * Display a mesh on the face of the intersection point.
   *
   * Credit: https://github.com/jujunjun110/aframe-crawling-cursor
   */
  drawProjection: (function () {
    // Hover mesh 5cm above intersection point.
    var hoverHeight = 0.05;
    var positionVector = new THREE.Vector3();
    var normalVector = new THREE.Vector3();
    var lookAtTargetVector = new THREE.Vector3();
    var zeroVector = new THREE.Vector3(0, 0, 0);

    return function drawProjectionClosure () {
      var globalNormal;
      var intersection = this.intersection;
      var matrix;
      var projectionEl = this.projectionEl;

      if (!intersection) { return; }

      // Get matrix that represents item's movement, rotation, scale in world space.
      matrix = intersection.object.matrixWorld;

      // Remove parallel movement from matrix.
      matrix.setPosition(zeroVector);

      // Change local normal to global normal.
      globalNormal = normalVector.copy(intersection.face.normal);
      globalNormal.applyMatrix4(matrix).normalize();

      // lookAtTarget coordinate = intersection coordinate + global normal vector.
      lookAtTargetVector.addVectors(intersection.point, globalNormal);
      projectionEl.object3D.lookAt(lookAtTargetVector);

      // cursor coordinate = intersection coordinate + normal vector * hoverHeight.
      positionVector.addVectors(intersection.point, globalNormal.multiplyScalar(hoverHeight));
      projectionEl.setAttribute('position', positionVector);
    };
  })()
});
