/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('cursor', function () {
  /**
   * Create camera with a cursor inside.
   */
  setup(function (done) {
    var cameraEl = this.cameraEl = entityFactory();
    var cursorEl = this.cursorEl = document.createElement('a-entity');
    cameraEl.setAttribute('camera', 'active: true');
    cursorEl.setAttribute('cursor', '');

    // Wait for elements to load.
    cursorEl.addEventListener('loaded', function () {
      done();
    });
    cameraEl.appendChild(cursorEl);
  });

  suite('init', function () {
    test('initializes raycasters as dependency', function () {
      assert.ok(this.cursorEl.components.raycaster);
    });
  });

  suite('tick', function () {
    test('updates raycaster origin when position is changed', function () {
      var cursorEl = this.cursorEl;
      this.cameraEl.setAttribute('position', {x: 1, y: 2, z: 3});
      cursorEl.sceneEl.tick();
      assert.shallowDeepEqual(cursorEl.getAttribute('raycaster').origin, {x: 1, y: 2, z: 3});
    });
  });

  suite.only('onIntersection', function () {
    setup(function () {
      this.intersectedEl = document.createElement('a-entity');
    });

    test('does not do anything if already intersecting', function () {
      var cursorEl = this.cursorEl;
      var intersectedEl = this.intersectedEl;
      cursorEl.components.cursor.intersectedEl = intersectedEl;
      cursorEl.emit('raycaster-intersection', {els: [intersectedEl]});
      assert.notOk(intersectedEl.is('cursor-hovered'));
    });

    test('sets hovering state', function () {
      var cursorEl = this.cursorEl;
      var intersectedEl = this.intersectedEl;
      cursorEl.emit('raycaster-intersection', {els: [intersectedEl]});
      assert.ok(intersectedEl.is('cursor-hovered'));
    });
  });
});
