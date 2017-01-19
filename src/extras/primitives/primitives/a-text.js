/* Experimental text primitive.
 */
var getMeshMixin = require('../getMeshMixin');
var registerPrimitive = require('../primitives').registerPrimitive;
var utils = require('../../../utils/');

registerPrimitive('a-text', utils.extendDeep({}, getMeshMixin(), {
  defaultComponents: {
    'bmfont-text': {anchor: 'align', width: 5}
  },
  mappings: {
    align: 'bmfont-text.align',
    anchor: 'bmfont-text.anchor',
    baseline: 'bmfont-text.baseline',
    color: 'bmfont-text.color',
    height: 'bmfont-text.height',
    letterspacing: 'bmfont-text.letterSpacing',
    lineheight: 'bmfont-text.lineHeight',
    fnt: 'bmfont-text.fnt',
    fntimage: 'bmfont-text.fntImage',
    mode: 'bmfont-text.mode',
    opacity: 'bmfont-text.opacity',
    text: 'bmfont-text.text',
    width: 'bmfont-text.width',
    wrapcount: 'bmfont-text.wrapcount',
    wrappixels: 'bmfont-text.wrappixels'
  }
}));
