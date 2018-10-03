/* global THREE */
var register = require('../../core/component').registerComponent;

module.exports.Component = register('overlay', {
  schema: {
    enabled: {default: true},
    objects: {default: ''}
  },

  init: function () {
    this.objectsVisibility = [];
  },

  update: function () {
    var data = this.data;
    this.scene = data.objects && new THREE.Scene();
    this.restoreObjects();
    if (!data.enabled) { return; }
    this.initObjects();
  },

  initObjects: function () {
    var els;
    var scene = this.scene;
    if (!scene) { return; }
    els = this.els = this.el.sceneEl.querySelectorAll(this.data.objects);
    for (var i = 0; i < els.length; ++i) {
      if (!els[i].object3D) { continue; }
      scene.add(els[i].object3D);
    }
  },

  render: function () {
    var renderer = this.el.renderer;
    var autoClear = renderer.autoClear;
    renderer.autoClear = false;
    renderer.clearDepth();
    this.scene.visible = true;
    this.el.effect.render(this.scene, this.el.camera);
    // Hide objects so they are not rendered on first pass.
    this.scene.visible = false;
    renderer.autoClear = autoClear;
  },

  /* Return ownership to the a-scene THREE.Scene */
  restoreObjects: function () {
    var els = this.els;
    var scene = this.scene;
    var i;
    if (!this.els) { return; }
    for (i = 0; i < els.length; ++i) {
      scene && scene.remove(els[i].object3D);
      this.el.object3D.add(els[i].object3D);
    }
  },

  remove: function () {
    this.restoreObjects();
  }
});
