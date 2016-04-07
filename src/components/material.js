/* global Promise */
var utils = require('../utils');
var component = require('../core/component');
var THREE = require('../lib/three');
var shader = require('../core/shader');

var dummyMaterial = new THREE.MeshBasicMaterial();
var diff = utils.diff;
var registerComponent = component.registerComponent;
var shaders = shader.shaders;
var shaderNames = shader.shaderNames;

/**
 * Material component.
 *
 * @member {object} shader - Determines how material is shaded. Defaults to `standard`,
 *         three.js's implementation of PBR. Another standard shading model is `flat` which
 *         uses MeshBasicMaterial.
 */
module.exports.Component = registerComponent('material', {
  schema: {
    shader: { default: 'standard', oneOf: shaderNames },
    transparent: { default: false },
    opacity: { default: 1.0, min: 0.0, max: 1.0 },
    side: { default: 'front', oneOf: ['front', 'back', 'double'] },
    depthTest: { default: true }
  },

  init: function () {
    this.material = null;
  },

  /**
   * Update or create material.
   *
   * @param {object|null} oldData
   */
  update: function (oldData) {
    var data = this.data;
    var dataDiff = oldData ? diff(oldData, data) : data;
    var el = this.el;
    var material;
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var system = this.system;

    if (!this.material || dataDiff.shader) {
      // If shader has changed, ask material system for the material.
      if (this.material) { system.unuseMaterial(oldData); }
      material = system.getOrCreateMaterial(data, el);
    } else {
      // If shader has not changed, ask material system to update the material.
      material = system.getUpdatedMaterial(data, oldData, el);
    }

    // Set material on mesh.
    mesh.material = this.material = material;
  },

  /**
   * Remove material on remove (callback).
   * Dispose of it from memory and unsubscribe from scene updates.
   */
  remove: function () {
    var mesh = this.el.getObject3D('mesh');
    if (!mesh) { return; }
    mesh.material = dummyMaterial;
    this.system.unuseMaterial(this.data);
  },

  /**
   * Update material component schema based on material/shader type.
   *
   * @param {object} data - New data passed by Component.
   */
  updateSchema: function (data) {
    var newShader = data.shader;
    var currentShader = this.data && this.data.shader;
    var schema = shaders[newShader] && shaders[newShader].schema;

    // Material has no schema.
    if (!schema) { throw new Error('Unknown shader schema `' + newShader + '`'); }
    // Nothing has changed.
    if (currentShader && newShader === currentShader) { return; }

    this.extendSchema(schema);
    this.updateBehavior();
  },

  updateBehavior: function () {
    var scene = this.el.sceneEl;
    var schema = this.schema;
    var self = this;
    var tickProperties = {};
    var tick = function (time, delta) {
      var keys = Object.keys(tickProperties);
      keys.forEach(update);
      function update (key) { tickProperties[key] = time; }
      self.shader.update(tickProperties);
    };
    var keys = Object.keys(schema);
    keys.forEach(function (key) {
      if (schema[key].type === 'time') {
        self.tick = tick;
        tickProperties[key] = true;
        scene.addBehavior(self);
      }
    });
    if (Object.keys(tickProperties).length === 0) {
      scene.removeBehavior(this);
    }
  }
});
