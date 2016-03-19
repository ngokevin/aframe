var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');
var utils = require('../utils/');

var toVec3 = utils.coordinates.toVector3;

/**
 * Raycaster component.
 *
 * Pass options to three.js Raycaster including which objects to test.
 * Poll for intersections.
 * Emit event on origin entity and on target entity on intersect.
 *
 * @member {array} intersectedEls - List of currently intersected entities.
 * @member {array} objects - Cached list of meshes to intersect.
 * @member {number} prevCheckTime - Previous time intersection was checked. To help interval.
 * @member {object} raycaster - three.js Raycaster.
 */
module.exports.Component = registerComponent('raycaster', {
  schema: {
    origin: {type: 'vec3'},
    direction: {type: 'vec3'},
    far: {default: Infinity}, // Infinity.
    interval: {default: 100},
    near: {default: 0},
    objects: {type: 'selectorAll'},
    recursive: {default: true}
  },

  init: function () {
    this.intersectedEls = [];
    this.objects = null;
    this.prevCheckTime = null;
    this.raycaster = new THREE.Raycaster();
  },

  /**
   * Create or update raycaster object.
   */
  update: function () {
    var data = this.data;
    var raycaster = this.raycaster;
    // Set raycaster properties.
    raycaster.set(toVec3(data.origin), toVec3(data.direction));
    raycaster.far = data.far;
    raycaster.near = data.near;

    this.refreshObjects();
  },

  /**
   * Update list of objects to test for intersection.
   */
  refreshObjects: function () {
    var data = this.data;
    var i;

    // Push meshes onto list of objects to intersect.
    if (data.objects) {
      this.objects = [];
      for (i = 0; i < data.objects.length; i++) {
        var entityEl = data.objects[i];
        if (!('mesh' in entityEl.object3DMap)) { continue; }
        this.objects.push(entityEl.getObject3D('mesh'));
      }
      return;
    }

    // If objects not defined, intersect with everything.
    this.objects = this.el.sceneEl.object3D.children;
  },

  /**
   * Check for intersections and cleared intersections on an interval.
   */
  tick: function (time) {
    var el = this.el;
    var data = this.data;
    var prevIntersectedEls = this.intersectedEls.slice();
    var intersectedEls = this.intersectedEls = [];  // Reset intersectedEls.
    var intersections;
    var prevCheckTime = this.prevCheckTime;

    // Only check for intersection if interval time has passed.
    if (prevCheckTime && (time - prevCheckTime < data.interval)) { return; }

    // Raycast.
    intersections = this.raycaster.intersectObjects(this.objects, data.recursive);

    // Update intersectedEls object first in case event handlers try to inspect it.
    intersections.forEach(function emitEvents (intersection) {
      intersectedEls.push(intersection.object.el);
    });

    // Emit intersected on intersected entity per intersected entity.
    intersections.forEach(function emitEvents (intersection) {
      var intersectedEl = intersection.object.el;
      intersectedEl.emit('raycaster-intersected', {el: el, intersection: intersection});
    });

    // Emit all intersections at once on raycasting entity.
    if (intersections.length) {
      el.emit('raycaster-intersection', {
        els: intersections.map(function getEl (intersection) {
          return intersection.object.el;
        }),
        intersections: intersections
      });
    }

    // Emit intersection cleared on both entities per formerly intersected entity.
    prevIntersectedEls.forEach(function checkStillIntersected (intersectedEl) {
      if (intersectedEls.indexOf(intersectedEl) !== -1) { return; }
      el.emit('raycaster-intersection-cleared', {el: intersectedEl});
      intersectedEl.emit('raycaster-intersected-cleared', {el: el});
    });
  }
});
