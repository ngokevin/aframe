var registerComponent = require('../core/component').registerComponent;
var registerShader = require('../core/shader').registerShader;
var THREE = require('../lib/three');

module.exports.Component = registerComponent('link', {
  schema: {
    url: {default: ''},
    on: {default: 'click'},
    src: {type: 'asset'},
    color: {default: 'rgb(239,45,94);', type: 'color'},
    highlighted: {default: false},
    highlightColor: {default: 'white', type: 'color'}
  },

  init: function () {
    // var self = this;
    this.redirect = this.redirect.bind(this);
    // this.el.sceneEl.addEventListener('onvrdisplayactivate', onVRDisplayActivate);
    this.initVisualAspect();
    // function onVRDisplayActivate (evt) { self.displayName = evt.detail.display.displayName; }
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    var strokeColor = data.highlighted ? data.highlightColor : data.color;
    el.setAttribute('material', 'strokeColor', strokeColor);
    if (data.on !== oldData.on) {
      if (oldData.on) { el.removeEventListener(oldData.on, this.redirect); }
      el.addEventListener(data.on, this.redirect);
    }
    if (!data.src || oldData.src === data.src) { return; }
    el.setAttribute('material', 'pano', data.src);
  },

  initVisualAspect: function () {
    var el = this.el;
    var textEl = this.textEl || document.createElement('a-entity');
    // el.setAttribute('geometry', {primitive: 'plane', buffer: false, height: 1, width: 1, depth: 1});
    el.setAttribute('geometry', {primitive: 'circle', radius: 1, segments: 64});
    el.setAttribute('material', {
      shader: 'portal',
      pano: this.data.src,
      side: 'double'
    });
    textEl.setAttribute(
      'text',
      'color: white; align: center; font: dejavu; ' +
      'value: http://www.mozilla.org; width: 4'
    );
    textEl.setAttribute('position', '0 1.4 0');
    // el.appendChild(textEl);
  },

  redirect: function () {
    var displayName = this.displayName;
    var urlParameter = displayName ? '?activeVRDisplay=' + displayName : '';
    if (!this.el.isPlaying) { return; }
    window.location = this.data.url + urlParameter;
  },

  tick: (function () {
    var elWorldPosition = new THREE.Vector3();
    var cameraWorldPosition = new THREE.Vector3();
    var scale = new THREE.Vector3();
    var quaternion = new THREE.Quaternion();
    var dummyObject3D = new THREE.Object3D();
    var previousQuaternion;
    return function () {
      var el = this.el;
      var object3D = el.object3D;
      var camera = el.sceneEl.camera;
      var distance;
      var interpolation = 0.0;
      object3D.updateMatrixWorld();
      camera.updateMatrixWorld();
      object3D.matrix.decompose(elWorldPosition, quaternion, scale);
      elWorldPosition.setFromMatrixPosition(object3D.matrixWorld);
      cameraWorldPosition.setFromMatrixPosition(camera.matrixWorld);
      distance = elWorldPosition.distanceTo(cameraWorldPosition);
      dummyObject3D.quaternion.copy(quaternion);
      dummyObject3D.lookAt(cameraWorldPosition);
      if (!previousQuaternion) { previousQuaternion = quaternion.clone(); }
      interpolation = Math.log(distance / 8);
      // Clamp value 0.0 .. 1.0
      interpolation = Math.min(Math.max(interpolation, 0.0), 1.0);
      object3D.quaternion.copy(previousQuaternion).slerp(dummyObject3D.quaternion, interpolation);
    };
  })(),

  remove: function () {
    this.el.removeEventListener(this.data.on, this.redirect);
  }
});

/* eslint-disable */
registerShader('portal', {
  schema: {
    pano: {type: 'map', is: 'uniform'},
    strokeColor: {default: '1 0 0', type: 'color', is: 'uniform'}
  },

  vertexShader: [
    'vec3 portalPosition;',
    'varying vec3 vWorldPosition;',
    'varying vec3 sphereCenter;',
    'varying float vDistanceToCenter;',
    'varying float vDistance;',
    'void main() {',
      'vDistanceToCenter = clamp(length(position - vec3(0.0, 0.0, 0.0)), 0.0, 1.0);',
      'portalPosition = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;',
      'vDistance = length(portalPosition - cameraPosition);',
      'vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',
      'sphereCenter = (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;',
      'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
    '}'
  ].join('\n'),

  fragmentShader: [
    '#define RECIPROCAL_PI2 0.15915494',
    'uniform sampler2D pano;',
    'uniform vec3 strokeColor;',
    'varying float vDistanceToCenter;',
    'varying float vDistance;',
    'varying vec3 vWorldPosition;',
    'varying vec3 sphereCenter;',
    'void main() {',
      'vec3 direction = normalize(vWorldPosition - cameraPosition);',
      'vec2 sampleUV;',
      'sampleUV.y = saturate(direction.y * 0.5 + 0.5);',
      'sampleUV.x = atan(direction.z, direction.x) * -RECIPROCAL_PI2 + 0.5;',
      'if (vDistanceToCenter > 0.95) {',
        'gl_FragColor = vec4(strokeColor, 1.0);',
      '} else {',
        'gl_FragColor = mix(texture2D(pano, sampleUV), vec4(0.93, 0.17, 0.36, 1.0), clamp(pow((vDistance / 10.0), 2.0), 0.0, 1.0));',
      '}',
    '}'
  ].join('\n')
});
/* eslint-enable */
