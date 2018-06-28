/* global THREE */
var registerEffect = require('../../../core/effect').registerEffect;

require('../../../../vendor/effects/SSAOShader');
require('../../../../vendor/effects/SSAOPass');

registerEffect('ssao', {
  schema: {
    radius: {default: 32},
    aoClamp: {default: 0.25},
    lumInfluence: {default: 0.7}
  },

  initPass: function () {
    this.pass = new THREE.SSAOPass(this.el.object3D, this.el.camera);
  },

  update: function () {
    var data = this.data;
    var pass = this.pass;
    if (!pass) { return; }
    pass.radius = data.radius;
    pass.aoClamp = data.aoClamp;
    pass.lumInfluence = data.lumInfluence;
  }
});
