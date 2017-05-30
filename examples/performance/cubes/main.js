/* global AFRAME */
AFRAME.registerComponent('main', {
  init: function () {
    this.urlParams = getUrlParams();
    this.createCubes();
    this.createRaycaster();
  },

  createCubes: function () {
    var cubeEl;
    var i;
    var numObjects;
    var urlParams = this.urlParams;

    numObjects = urlParams.numobjects || 5000;

    for (i = 0; i < numObjects; i++) {
      cubeEl = document.createElement('a-entity');
      if (urlParams.component) {
        cubeEl.setAttribute(urlParams.component, '');
      }
      cubeEl.setAttribute('position', getRandomPosition(100));
      cubeEl.setAttribute('geometry', {primitive: 'box'});
      cubeEl.setAttribute('material', {color: getRandomColor(), shader: 'flat'});
      this.el.sceneEl.appendChild(cubeEl);
    }
  },

  createRaycaster: function () {
    var camera;
    var i;
    var raycasterEl;
    var urlParams = this.urlParams;

    if (!urlParams.numraycasters) { return; }

    camera = document.querySelector('a-camera');
    for (i = 0; i < urlParams.numraycasters; i++) {
      raycasterEl = document.createElement('a-cursor');
      camera.appendChild(raycasterEl);
    }
  }
});

function getRandomColor () {
  return '#' + ('000000' + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
}

function getRandomPosition (distribution) {
  return {
    x: Math.random() * distribution - distribution / 2,
    y: Math.random() * distribution - distribution / 2,
    z: Math.random() * distribution - distribution
  };
}

function getUrlParams () {
  var decode = function (s) { return decodeURIComponent(s.replace(pl, ' ')); };
  var match;
  var pl = /\+/g;  // Regex for replacing addition symbol with a space.
  var query = window.location.search.substring(1);
  var search = /([^&=]+)=?([^&]*)/g;
  var urlParams = {};

  match = search.exec(query);
  while (match) {
    urlParams[decode(match[1])] = decode(match[2]);
    match = search.exec(query);
  }
  return urlParams;
}
