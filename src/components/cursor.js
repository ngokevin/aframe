var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');

var EVENTS = {
  CLICK: 'cursor-click',
  FUSING: 'cursor-fusing',
  HOVERED: 'cursor-hovered',
  HOVERING: 'cursor-hovering',
  MOUSEENTER: 'cursor-mouseenter',
  MOUSEDOWN: 'cursor-mousedown',
  MOUSELEAVE: 'cursor-mouseleave',
  MOUSEUP: 'cursor-mouseup'
};

/**
 * Cursor component. Applies the raycaster component specifically for starting the raycaster
 * from the camera and pointing from camera's facing direction, and then only returning the
 * closest intersection. Cursor can be fine-tuned by setting raycaster properties.
 *
 * @member {object} cursorVec3 - three.js Vector3 for cursor position.
 * @member {object} directionVec3 - three.js Vector3 for raycaster direction.
 * @member {object} fuseTimeout - Timeout to trigger fuse-click.
 * @member {Element} mouseDownEl - Entity that was last mousedowned during current click.
 * @member {Element} intersectedEl - Currently-intersected entity. Used to keep track to
 *         emit events when unintersecting.
 * @member {object} originVec3 - three.js Vector3 for origin position.
 */
module.exports.Component = registerComponent('cursor', {
  dependencies: ['raycaster'],

  schema: {
    fuse: {default: utils.isMobile()},
    fuseTimeout: {default: 1500, min: 0}
  },

  init: function () {
    var el = this.el;
    var canvas = el.sceneEl.canvas;
    this.cursorVec3 = new THREE.Vector3();
    this.directionVec3 = new THREE.Vector3();
    this.fuseTimeout = null;
    this.mouseDownEl = null;
    this.intersectedEl = null;
    this.originVec3 = new THREE.Vector3();

    // Wait for canvas to load.
    if (!canvas) {
      el.sceneEl.addEventListener('render-target-loaded', this.init.bind(this));
      return;
    }

    // Attach event listeners.
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
    el.addEventListener('raycaster-intersection', this.onIntersection.bind(this));
    el.addEventListener('raycaster-intersection-cleared',
                        this.onIntersectionCleared.bind(this));
  },

  /**
   * Update raycaster origin and direction.
   */
  tick: function () {
    var el = this.el;
    var cursorObj = el.object3D;
    var cursorVec3 = this.cursorVec3;
    var directionVec3 = this.directionVec3;
    var parentObj = el.parentNode.object3D;
    var originVec3 = this.originVec3;

    parentObj.updateMatrixWorld();
    originVec3.setFromMatrixPosition(parentObj.matrixWorld);
    cursorVec3.setFromMatrixPosition(cursorObj.matrixWorld);
    directionVec3 = directionVec3.copy(cursorVec3).sub(originVec3).normalize();

    el.setAttribute('raycaster', {
      origin: originVec3,
      direction: directionVec3
    });
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
  onMouseUp: function () {
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
    var data = this.data;
    var el = this.el;
    var intersectedEl = evt.detail.els[0]; // Grab the closest.

    // Set intersected entity if not already intersecting.
    if (this.intersectedEl === intersectedEl) { return; }
    this.intersectedEl = intersectedEl;

    // Hovering.
    intersectedEl.addState(EVENTS.HOVERED);
    intersectedEl.emit(EVENTS.MOUSEENTER);
    el.addState(EVENTS.HOVERING);

    // Begin fuse if necessary.
    if (data.timeout === 0 || !data.fuse) { return; }
    el.addState(EVENTS.FUSING);
    this.fuseTimeout = setTimeout(function fuse () {
      el.removeState(EVENTS.FUSING);
      self.twoWayEmit(EVENTS.CLICK);
    }, data.timeout);
  },

  /**
   * Handle intersection cleared.
   */
  onIntersectionCleared: function (evt) {
    var el = evt.detail.el;

    // Not intersecting.
    if (!el || !this.intersectedEl) { return; }

    // No longer hovering (or fusing).
    el.removeState(EVENTS.HOVERED);
    el.emit(EVENTS.MOUSELEAVE);
    this.el.removeState(EVENTS.HOVERING);
    this.el.removeState(EVENTS.FUSING);

    // Unset intersected entity.
    this.intersectedEl = null;

    // Clear fuseTimeout.
    clearTimeout(this.fuseTimeout);
  },

  /**
   * Helper to emit on both the cursor and the intersected entity.
   */
  twoWayEmit: function (evt) {
    var intersectedEl = this.intersectedEl;
    this.el.emit(evt, {target: this.intersectedEl});
    if (intersectedEl) { intersectedEl.emit(evt); }
  }
});
