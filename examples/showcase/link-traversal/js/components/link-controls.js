/* global AFRAME */
AFRAME.registerComponent('link-controls', {
  schema: {hand: {default: 'left'}},
  init: function () {
    var el = this.el;
    el.setAttribute('raycaster', {
      far: 10,
      objects: '[link]',
      rotation: 0
    });
    this.onIntersection = this.onIntersection.bind(this);
    this.onGripDown = this.onGripDown.bind(this);
    this.onTriggerDown = this.onTriggerDown.bind(this);
    el.addEventListener('gripdown', this.onGripDown);
    el.addEventListener('triggerdown', this.onGripDown);
    el.setAttribute('line', 'end: 0 0 -5');
    // Init Controllers
    this.initVive();
    this.initTouch();
    this.initDaydream();
    el.addEventListener('raycaster-intersection', this.onIntersection);
    el.addEventListener('raycaster-intersection-cleared', this.onIntersectionCleared);
  },

  initVive: function () {
    this.el.setAttribute('vive-controls', {hand: this.data.hand});
  },

  initTouch: function () {
    this.el.setAttribute('oculus-touch-controls', {hand: this.data.hand});
  },

  initDaydream: function () {
    this.el.setAttribute('daydream-controls', {hand: this.data.hand});
  },

  onGripDown: function () {
    if (!this.selectedLinkEl) { return; }
    this.selectedLinkEl.components.link.redirect();
  },

  onTriggerDown: function () {
    if (!this.selectedLinkEl) { return; }
    this.selectedLinkEl.components.link.redirect();
  },

  onIntersection: function (evt) {
    var els = evt.detail.els;
    var self = this;
    els.forEach(function (el) {
      if (el.hasAttribute('link')) {
        el.setAttribute('link', 'highlighted', true);
        self.selectedLinkEl = el;
      }
    });
  },

  onIntersectionCleared: function (evt) {
    evt.detail.el.setAttribute('link', 'highlighted', false);
  }
});
