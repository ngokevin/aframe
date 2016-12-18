var registerSystem = require('../core/system').registerSystem;

/**
 * Tracked controls system.
 * It maintains a list with the available tracked controllers
 */
module.exports.System = registerSystem('link', {
  init: function () {
    // var self = this;
    // enter VR on vrdisplayactivate (e.g. putting on headset)
    window.addEventListener('vrdisplayactivate', function () {
      // console.log('VR DISPLAY ACTIVATE');
      // lself.sceneEl.enterVR();
    }, false);
    // exit VR on vrdisplaydeactivate (e.g. taking off headset)
    // window.addEventListener('vrdisplaydeactivate', function () { self.exitVR(); }, false);
  }
});
