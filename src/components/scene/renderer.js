var registerComponent = require('../../core/component').registerComponent;
var THREE = require('../../lib/three');

/**
 * Renderer component for the scene. Creates WebGLRenderer and VREffect.
 */
module.exports.Component = registerComponent('renderer', {
  dependencies: ['canvas'],

  schema: {
    antialias: {default: false},
    clearColor: {type: 'color', default: '#FFF'},
    clearOpacity: {default: 1},
    sortObjects: {default: false},
    transparent: {default: true}
  },

  init: function () {
    var renderer;
    var sceneEl = this.el;

    renderer = this.createRenderer();
    sceneEl.renderer = renderer.renderer;
    sceneEl.effect = renderer.effect;
    sceneEl.emit('renderer-loaded', renderer);
  },

  /**
   * Create WebGLRenderer (and VREffect) if it doesn't exist. Else just return it.
   *
   * @returns {Object} - {effect, renderer}
   */
  createRenderer: function () {
    var data = this.data;
    var effect;
    var renderer;

    // Create renderer.
    renderer = new THREE.WebGLRenderer({
      alpha: data.transparent,
      antialias: data.antialias || window.hasNativeWebVRImplementation,
      canvas: this.el.canvas
    });
    renderer.setClearColor(data.clearColor, data.opacity);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.sortObjects = data.sortObjects;

    // Create effect.
    effect = new THREE.VREffect(renderer);

    return {effect: effect, renderer: renderer};
  }
});
