var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-link', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    link: {},
    geometry: {primitive: 'sphere', radius: 0.5},
    material: {shader: 'flat'}
  },

  mappings: {
    href: 'link.url'
  }
}));
