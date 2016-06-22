var registerComponent = require('../core/component').registerComponent;

module.exports.Component = registerComponent('link', {
  schema: {
    url: { default: '' },
    on: { default: 'click' }
  },

  init: function () {
    var self = this;
    this.redirect = this.redirect.bind(this);
    this.el.sceneEl.addEventListener('onvrdisplayactivate', onVRDisplayActivate);
    function onVRDisplayActivate (evt) {
      self.displayName = evt.detail.display.displayName;
    }
  },

  update: function (oldData) {
    var data = this.data;
    var el = this.el;
    if (data.on !== oldData.on) {
      if (oldData.on) {
        el.removeEventListener(oldData.on, this.redirect);
      }
      el.addEventListener(data.on, this.redirect);
    }
  },

  redirect: function () {
    var displayName = this.displayName;
    var urlParameter = displayName ? '?activeVRDisplay=' + displayName : '';
    if (!this.el.isPlaying) { return; }
    window.location = this.data.url + urlParameter;
  },

  remove: function () {
    this.el.removeEventListener(this.data.on, this.redirect);
  }
});
