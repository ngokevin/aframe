var registerSystem = require('../core/system').registerSystem;
var bind = require('../utils/bind');
var constants = require('../constants/');
var THREE = require('../lib/three');

var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';

var SHADOW_MAP_TYPE_MAP = {
  basic: THREE.BasicShadowMap,
  pcf: THREE.PCFShadowMap,
  pcfsoft: THREE.PCFSoftShadowMap
};

/**
 * Light system.
 *
 * Prescribes default lighting if not specified (one ambient, one directional).
 * Removes default lighting from the scene when a new light is added.
 *
 * @param {bool} defaultLights - Whether default lighting are defined.
 * @param {bool} userDefinedLights - Whether user lighting is defined.
 */
module.exports.System = registerSystem('light', {
  schema: {
    shadowMapType: {default: 'pcf', oneOf: ['basic', 'pcf', 'pcfsoft']},
    shadowMapRenderReverseSided: {default: true},
    shadowMapRenderSingleSided: {default: true}
  },

  init: function () {
    var sceneEl = this.sceneEl;
    var data = this.data;

    this.defaultLights = false;
    this.userDefinedLights = false;
    this.shadowMapEnabled = false;

    sceneEl.addEventListener('render-target-loaded', bind(function () {
      // Renderer is not initialized in most tests.
      if (!sceneEl.renderer) { return; }
      sceneEl.renderer.shadowMap.type = SHADOW_MAP_TYPE_MAP[data.shadowMapType];
      sceneEl.renderer.shadowMap.renderReverseSided = data.shadowMapRenderReverseSided;
      sceneEl.renderer.shadowMap.renderSingleSided = data.shadowMapRenderSingleSided;
      this.setShadowMapEnabled(this.shadowMapEnabled);
    }, this));

    // Wait for all entities to fully load before checking for existence of lights.
    // Since entities wait for <a-assets> to load, any lights attaching to the scene
    // will do so asynchronously.
    sceneEl.addEventListener('loaded', bind(this.setupDefaultLights, this));
  },

  /**
   * Notify scene that light has been added and to remove the default.
   *
   * @param {object} el - element holding the light component.
   */
  registerLight: function (el) {
    if (!el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
      // User added a light, remove default lights through DOM.
      this.removeDefaultLights();
      this.userDefinedLights = true;
    }
  },

  removeDefaultLights: function () {
    var defaultLights;
    var sceneEl = this.sceneEl;

    if (!this.defaultLights) { return; }
    defaultLights = document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']');
    for (var i = 0; i < defaultLights.length; i++) {
      sceneEl.removeChild(defaultLights[i]);
    }
    this.defaultLights = false;
  },

  /**
   * Prescibe default lights to the scene.
   * Does so by injecting markup such that this state is not invisible.
   * These lights are removed if the user adds any lights.
   */
  setupDefaultLights: function () {
    var sceneEl = this.sceneEl;
    var ambientLight;
    var directionalLight;

    if (this.userDefinedLights || this.defaultLights) { return; }
    ambientLight = document.createElement('a-entity');
    directionalLight = document.createElement('a-entity');
    ambientLight.setAttribute('light', {color: '#BBB', type: 'ambient'});
    ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    ambientLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(ambientLight);

    directionalLight.setAttribute('light', {color: '#FFF', intensity: 0.6});
    directionalLight.setAttribute('position', {x: -0.5, y: 1, z: 1});
    directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
    directionalLight.setAttribute(constants.AFRAME_INJECTED, '');
    sceneEl.appendChild(directionalLight);

    this.defaultLights = true;
  },

  /**
   * Enables/disables the renderer shadow map.
   * @param {boolean} enabled
   */
  setShadowMapEnabled: function (enabled) {
    var renderer = this.sceneEl.renderer;
    this.shadowMapEnabled = enabled;
    if (renderer) {
      renderer.shadowMap.enabled = enabled;
    }
  }
});
