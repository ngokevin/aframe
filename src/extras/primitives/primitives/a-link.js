var registerPrimitive = require('../primitives').registerPrimitive;

registerPrimitive('a-link', {
  defaultComponents: {
    link: {}
  },

  mappings: {
    href: 'link.url',
    src: 'link.src'
  }
});
