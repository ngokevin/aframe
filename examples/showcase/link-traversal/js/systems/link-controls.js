/* global AFRAME */
AFRAME.registerSystem('link-controls', {
  init: function () {
    var cursorEl = this.sceneEl.querySelector('#cursorRing');
    var handEls = this.sceneEl.querySelectorAll('[link-controls]');
    if (AFRAME.isMobile) {
      cursorEl.setAttribute('mixin', 'cursor');
      cursorEl.setAttribute('visible', 'true');
    } else {
      handEls[0].setAttribute('visible', 'true');
      handEls[1].setAttribute('visible', 'true');
    }
  }
});
