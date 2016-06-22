/* global AFRAME, THREE */
AFRAME.registerComponent('highlight', {
  dependencies: ['geometry'],

  schema: {
    color: {type: 'color', default: 'white'},
    lineWidth: {default: 3}
  },

  init: function () {
    this.onComponentChanged = this.onComponentChanged.bind(this);
  },

  play: function () {
    this.el.addEventListener('componentchanged', this.onComponentChanged);
  },

  pause: function () {
    this.el.removeEventListener('componentchanged', this.onComponentChanged);
  },

  onComponentChanged: function (evt) {
    if (evt.detail.name !== 'geometry') { return; }
    this.updateHighlight();
  },

  update: function () {
    if (!this.highlightLine) { this.updateHighlight(); }
    this.highlightLine.material.color.set(this.data.color);
    this.materialCircleLine.linewidth = this.data.lineWidth;
  },

  updateHighlight: function () {
    var highlightLine;
    var geometry = this.el.getObject3D('mesh').geometry;
    var geometryCircleLine;
    var materialCircleLine;
    var radius;
    geometry.computeBoundingSphere();
    radius = geometry.boundingSphere.radius;
    geometryCircleLine = new THREE.CircleGeometry(radius, 64);
    geometryCircleLine.vertices.shift();
    materialCircleLine = new THREE.LineBasicMaterial({color: this.data.color, transparent: true});
    materialCircleLine.linewidth = this.data.lineWidth;
    highlightLine = new THREE.Line(geometryCircleLine, materialCircleLine);
    highlightLine.doubleSided = true;
    highlightLine.scale.set(1.1, 1.1, 1.1);
    this.el.setObject3D('highlight', highlightLine);
    this.highlightLine = highlightLine;
    this.materialCircleLine = materialCircleLine;
  },

  tick: function () {
    var camera = this.el.sceneEl.camera;
    var cameraPosition;
    camera.updateMatrixWorld();
    cameraPosition = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    if (!this.highlightLine) { this.updateHighlight(); }
    this.highlightLine.parent.lookAt(cameraPosition);
  }
});
