var registerComponent = require('../core/component').registerComponent;

var THREE = require('../lib/three');
var createTextGeometry = require('three-bmfont-text');
var loadBMFont = require('load-bmfont');
var path = require('path');
var assign = require('object-assign');
var createSDF = require('three-bmfont-text/shaders/sdf');
var createMSDF = require('three-bmfont-text/shaders/msdf');
var createBasic = require('three-bmfont-text/shaders/basic');

var alignments = ['left', 'right', 'center'];
var anchors = alignments;
anchors.push('align');
var baselines = ['top', 'center', 'bottom'];

var DEFAULT_WIDTH = 1; // 1 matches other AFRAME default widths... 5 matches prior bmfont examples etc.

var FONT_BASE_URL = 'https://cdn.rawgit.com/chenzlabs/aframe-bmfont-component/4b8fa074289be8ca9cb11b96557c5e7b3b763c18/fonts/';
var fontMap = {
  'default': FONT_BASE_URL + 'DejaVu-sdf.fnt',
  'Aileron-Semibold': FONT_BASE_URL + 'Aileron-Semibold.fnt',
  'DejaVu': FONT_BASE_URL + 'DejaVu-sdf.fnt',
  'Exo2Bold': FONT_BASE_URL + 'Exo2Bold.fnt',
  'Exo2SemiBold': FONT_BASE_URL + 'Exo2SemiBold.fnt',
  'KelsonSans': FONT_BASE_URL + 'KelsonSans.fnt',
  'Monoid': FONT_BASE_URL + 'Monoid.fnt',
  'SourceCodePro': FONT_BASE_URL + 'SourceCodePro.fnt',
  'mozillavr': FONT_BASE_URL + 'mozillavr.fnt'
};

module.exports.Component = registerComponent('bmfont-text', {
  schema: {
    // scale is now determined by width and wrappixels/wrapcount... scale: {default: 0.003},
    font: {default: ''},
    tabSize: {default: 4},
    anchor: {default: 'center', oneOf: anchors}, // center default to match primitives like plane; if 'align', null or undefined, same as align
    baseline: {default: 'center', oneOf: baselines},
    text: {type: 'string'},
    width: {type: 'number'}, // use AFRAME units i.e. meters, not arbitrary numbers... // default to geometry width, or if not present then DEFAULT_WIDTH
    height: {type: 'number'}, // use AFRAME units i.e. meters, not arbitrary numbers... // no default, will be populated at layout
    align: {type: 'string', default: 'left', oneOf: alignments},
    letterSpacing: {type: 'number', default: 0},
    lineHeight: {type: 'number'},  // default to font's lineHeight value
    fnt: {type: 'string', default: 'default'},
    fntImage: {type: 'string'}, // default to fnt but with .fnt replaced by .png
    mode: {default: 'normal', oneOf: ['normal', 'pre', 'nowrap']},
    color: {type: 'color', default: '#000'},
    opacity: {type: 'number', default: '1.0'},
    type: {default: 'SDF', oneOf: ['SDF', 'basic', 'MSDF']},
    side: {default: 'front', oneOf: ['front', 'back', 'double']},
    transparent: {default: true},
    alphaTest: {default: 0.5},
    wrappixels: {type: 'number'}, // if specified, units are bmfont pixels (e.g. DejaVu default is size 32)
    wrapcount: {type: 'number', default: 40} // units are 0.6035 * font size e.g. about one default font character (monospace DejaVu size 32)
  },

  init: function () {
    this.texture = new THREE.Texture();
    this.texture.anisotropy = 16; // ??

    this.geometry = createTextGeometry();

    this.updateMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.el.setObject3D('bmfont-text', this.mesh);
  },

  update: function (oldData) {
    var data = this.coerceData(this.data);

    // decide whether to update font, or just text data
    if (!oldData || oldData.fnt !== data.fnt) {
      // new font, will also subsequently change data & layout
      this.updateFont();
    } else if (this.currentFont) {
      // new data like change of text string
      var font = this.currentFont;
      var textrenderwidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
      var options = assign({}, data, { font: font, width: textrenderwidth, lineHeight: data.lineHeight || font.common.lineHeight });
      this.geometry.update(options);
      this.updateLayout(data);
    }
    // ??
    this.updateMaterial(oldData.type);
  },

  remove: function () {
    this.geometry.dispose();
    this.geometry = null;
    this.el.removeObject3D('bmfont-text');
  },

  coerceData: function (data) {
    // We have to coerce some data to numbers/booleans
    data = assign({}, data);
    if (typeof data.lineHeight !== 'undefined') {
      data.lineHeight = parseFloat(data.lineHeight);
      if (!isFinite(data.lineHeight)) { data.lineHeight = undefined; }
    }
    if (typeof data.width !== 'undefined') {
      data.width = parseFloat(data.width);
      if (!isFinite(data.width)) { data.width = undefined; }
    }
    return data;
  },

  updateMaterial: function (oldType) {
    if (oldType !== this.data.type) {
      var data = {
        side: threeSideFromString(this.data.side),
        transparent: this.data.transparent,
        alphaTest: this.data.alphaTest,
        color: this.data.color,
        opacity: this.data.opacity,
        map: this.texture
      };
      var shader;
      if (this.data.type === 'SDF') {
        shader = createSDF(data);
      } else if (this.data.type === 'MSDF') {
        shader = createMSDF(data);
      } else {
        shader = createBasic(data);
      }
      this.material = new THREE.RawShaderMaterial(shader);
    } else {
      this.material.uniforms.opacity.value = this.data.opacity;
      this.material.uniforms.color.value.set(this.data.color);
      this.material.uniforms.map.value = this.texture;
    }

    if (this.mesh) {
      this.mesh.material = this.material;
    }
  },

  registerFont: function (key, url) { fontMap[key] = url; },

  lookupFont: function (keyOrUrl) { return fontMap[keyOrUrl] || keyOrUrl; },

  updateFont: function () {
    if (!this.data.fnt) {
      console.error(new TypeError('No font specified for bmfont text!'));
      return;
    }

    var geometry = this.geometry;
    var self = this;
    this.mesh.visible = false;
    loadBMFont(this.lookupFont(this.data.fnt), onLoadFont);

    function onLoadFont (err, font) {
      if (err) {
        console.error(new Error('Error loading font ' + self.data.fnt +
          '\nMake sure the path is correct and that it points' +
          ' to a valid BMFont file (xml, json, fnt).\n' + err.message));
        return;
      }

      if (font.pages.length !== 1) {
        console.error(new Error('Currently only single-page bitmap fonts are supported.'));
        return;
      }
      var data = self.coerceData(self.data);

      var src = self.data.fntImage || self.lookupFont(self.data.fnt).replace('.fnt', '.png') || path.dirname(data.fnt) + '/' + font.pages[0];
      var textrenderwidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
      var options = assign({}, data, { font: font, width: textrenderwidth, lineHeight: data.lineHeight || font.common.lineHeight });
      geometry.update(options);
      self.mesh.geometry = geometry;

      var obj3d = self.el.object3D;
      if (obj3d.children.indexOf(self.mesh) === -1) {
        self.el.object3D.add(self.mesh);
      }

      loadTexture(src, onLoadTexture);
      self.currentFont = font;
      self.updateLayout(data);
    }

    function onLoadTexture (image) {
      self.mesh.visible = true;
      if (image) {
        self.texture.image = image;
        self.texture.needsUpdate = true;
      }
    }
  },

  updateLayout: function (data) {
    var el = this.el;
    var font = this.currentFont;
    var geometry = this.geometry;
    var elgeo = el.getAttribute('geometry');
    var width = data.width || (elgeo && elgeo.width) || DEFAULT_WIDTH;
    var textrenderwidth = data.wrappixels || (data.wrapcount * 0.6035 * font.info.size);
    var textScale = width / textrenderwidth;
    var height = textScale * geometry.layout.height;
    var x;
    var y;
    var layout = this.geometry.layout;
    var anchor = data.anchor === 'align' ? data.align : data.anchor;
    var baseline = data.baseline;

    // update geometry dimensions to match layout, if not specified
    if (elgeo) {
      if (!elgeo.width) { el.setAttribute('geometry', 'width', width); }
      if (!elgeo.height) { el.setAttribute('geometry', 'height', height); }
    }

    // anchors text left/center/right
    if (anchor === 'left') {
      x = 0;
    } else if (anchor === 'right') {
      x = -layout.width;
    } else if (anchor === 'center') {
      x = -layout.width / 2;
    } else {
      throw new TypeError('invalid anchor ' + anchor);
    }

    // anchors text to top/center/bottom
    if (baseline === 'bottom') {
      y = 0;
    } else if (baseline === 'top') {
      y = -layout.height + layout.ascender;
    } else if (baseline === 'center') {
      y = -layout.height / 2;
    } else {
      throw new TypeError('invalid baseline ' + baseline);
    }

    this.mesh.position.x = x * textScale;
    this.mesh.position.y = y * textScale;
    this.mesh.position.z = 0.001; // put text slightly in front in case there is a plane or other geometry
    this.mesh.scale.set(textScale, -textScale, textScale);
    this.geometry.computeBoundingSphere();
  }
});

function loadTexture (src, cb) {
  var loader = new THREE.ImageLoader();
  loader.load(src, function (image) {
    cb(image);
  }, undefined, function () {
    console.error('Could not load bmfont texture "' + src +
      '"\nMake sure it is correctly defined in the bitmap .fnt file.');
    cb(null);
  });
}

function threeSideFromString (str) {
  switch (str) {
    case 'double': return THREE.DoubleSide;
    case 'front': return THREE.FrontSide;
    case 'back': return THREE.BackSide;
    default:
      throw new TypeError('unknown side string ' + str);
  }
}
