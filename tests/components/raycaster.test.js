/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('raycaster', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('raycaster', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('init', function () {
    test('initializes raycaster', function () {
      assert.ok(this.el.components.raycaster.raycaster);
    });
  });

  suite('update', function () {
    test('can update far', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'far', 50);
      assert.equal(el.components.raycaster.raycaster.far, 50);
    });

    test('can update direction', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'direction', {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.components.raycaster.raycaster.ray.direction,
                              {x: 1, y: 2, z: 3});
    });

    test('can update near', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'near', 5);
      assert.equal(el.components.raycaster.raycaster.near, 5);
    });

    test('defaults to intersecting all objects', function () {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      var objects;
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);

      el.components.raycaster.refreshObjects();
      objects = el.components.raycaster.objects;
      assert.equal(objects, el.sceneEl.object3D.children);
    });

    test('can set objects to intersect', function () {
      var el = this.el;
      var el2 = document.createElement('a-entity');
      var el3 = document.createElement('a-entity');
      el2.setAttribute('class', 'clickable');
      el.sceneEl.appendChild(el2);
      el.sceneEl.appendChild(el3);

      el.setAttribute('raycaster', 'objects', '.clickable');
      assert.shallowDeepEqual(el.components.raycaster.objects, [el2.getObject3D('mesh')]);
    });

    test('can update origin', function () {
      var el = this.el;
      el.setAttribute('raycaster', 'origin', {x: 1, y: 2, z: 3});
      assert.shallowDeepEqual(el.components.raycaster.raycaster.ray.origin,
                              {x: 1, y: 2, z: 3});
    });
  });

  suite('tick', function () {
    test('is throttled by interval', function () {
      var el = this.el;
      var intersectSpy = this.sinon.spy(el.components.raycaster.raycaster,
                                        'intersectObjects');
      el.setAttribute('raycaster', 'interval', 1000);
      el.components.raycaster.prevCheckTime = 1000;
      el.sceneEl.tick(1500);
      assert.notOk(intersectSpy.called);

      el.setAttribute('raycaster', 'interval', 499);
      el.sceneEl.tick(1500);
      assert.ok(intersectSpy.called);
    });
  });

  suite('raycaster', function () {
    setup(function createRaycasterAndTarget (done) {
      var el = this.el;
      var targetEl = this.targetEl = document.createElement('a-entity');

      el.setAttribute('raycaster', {
        origin: '0 0 1',
        direction: '0 0 -1',
        near: 0.1,
        far: 10
      });

      targetEl.setAttribute('geometry', 'primitive: box; depth: 1; height: 1; width: 1;');
      targetEl.setAttribute('material', '');
      targetEl.setAttribute('position', '0 0 -1');
      targetEl.addEventListener('loaded', function finishSetup () {
        done();
      });
      el.sceneEl.appendChild(targetEl);
    });

    test('can catch basic intersection', function (done) {
      this.targetEl.addEventListener('raycaster-intersected', function () { done(); });
      this.el.sceneEl.tick();
    });

    test('updates intersectedEls', function (done) {
      var raycasterEl = this.el;
      var targetEl = this.targetEl;
      assert.equal(raycasterEl.components.raycaster.intersectedEls.length, 0);
      raycasterEl.addEventListener('raycaster-intersection', function () {
        assert.equal(raycasterEl.components.raycaster.intersectedEls[0], targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function (evt) {
        assert.equal(evt.detail.els[0], targetEl);
        assert.equal(evt.detail.intersections[0].object.el, targetEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity with details', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function (evt) {
        assert.equal(evt.detail.el, raycasterEl);
        done();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on raycaster entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      raycasterEl.addEventListener('raycaster-intersection', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('raycaster', {direction: '0 -1 0'});
        raycasterEl.addEventListener('raycaster-intersection-cleared', function (evt) {
          assert.equal(evt.detail.el, targetEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });

    test('emits event on intersected entity when clearing intersection', function (done) {
      var targetEl = this.targetEl;
      var raycasterEl = this.el;
      targetEl.addEventListener('raycaster-intersected', function () {
        // Point raycaster somewhere else.
        raycasterEl.setAttribute('raycaster', {direction: '0 -1 0'});
        targetEl.addEventListener('raycaster-intersected-cleared', function (evt) {
          assert.equal(evt.detail.el, raycasterEl);
          done();
        });
        raycasterEl.sceneEl.tick();
      });
      raycasterEl.sceneEl.tick();
    });
  });
});
