/* global AFRAME */
AFRAME.registerComponent('camera-rig', {
  init: function () {
    var el = this.el;
    if (!AFRAME.mobile) {
      el.setAttribute('position', '0 1.8 4');
    } else {
      el.setAttribute('position', '0 0 4');
    }
  }
});
