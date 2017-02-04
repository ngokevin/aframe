var component = require('../core/component');
var THREE = require('../lib/three');
var bind = require('../utils/bind');
var registerComponent = component.registerComponent;

/**
 * Shadow component.
 *
 * When applied to an entity, that entity's geometry and any descendants will cast or receive
 * shadows as specified by the `cast` and `receive` properties.
 *
 * @namespace shadow
 * @param {bool} [cast=false] - whether object will cast shadows.
 * @param {bool} [receive=false] - whether object will receive shadows.
 */
module.exports.Component = registerComponent('shadow', {
  schema: {
    cast: {default: true},
    receive: {default: true}
  },

  init: function () {
    this.onMeshChanged = bind(this.update, this);
    this.el.addEventListener('model-loaded', this.onMeshChanged);
  },

  update: function () {
    var data = this.data;
    this.el.object3D.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = data.cast;
        node.receiveShadow = data.receive;
      }
    });
  },

  remove: function () {
    var el = this.el;
    el.removeEventListener('model-loaded', this.onMeshChanged);
    el.object3D.traverse(function (node) {
      if (node instanceof THREE.Mesh) {
        node.castShadow = false;
        node.receiveShadow = false;
      }
    });
  }
});
