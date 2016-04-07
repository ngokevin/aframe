/* global assert, process, setup, suite, teardown, test */
var entityFactory = require('../helpers').entityFactory;

suite('material system', function () {
  setup(function (done) {
    var el = this.el = entityFactory();
    var self = this;
    el.addEventListener('loaded', function () {
      self.system = el.sceneEl.systems.material;
      done();
    });
  });

  suite('getOrCreateMaterial', function () {
    teardown(function () {
      this.system.clearCache();
    });

    test('sets hash on cache', function () {
      var data = {shader: 'flat'};
      var system = this.system;
      var hash = system.hash(data);

      assert.notOk(system.cache[hash]);
      system.getOrCreateMaterial(data);
      assert.ok(system.cache[hash]);
    });

    test('does not set hash on cache if skipCache', function () {
      var data = {shader: 'flat', skipCache: true};
      var system = this.system;
      var hash = system.hash(data);
      system.getOrCreateMaterial(data);
      assert.notOk(system.cache[hash]);
    });

    test('keeps track of uncached materials', function () {
      var data = {shader: 'flat', skipCache: true};
      var system = this.system;
      var material = system.getOrCreateMaterial(data);
      assert.ok(system.nonCachedShaders[material.uuid]);
    });

    test('caches identical materials', function () {
      var data = {shader: 'flat', side: 'double'};
      var material1;
      var material2;
      var system = this.system;
      var hash = system.hash(data);

      material1 = system.getOrCreateMaterial(data);
      assert.ok(material1);

      material2 = system.getOrCreateMaterial(data);
      assert.ok(material2);

      assert.equal(material1, material2);
      assert.equal(system.cacheCount[hash], 2);
    });
  });

  suite('getUpdatedMaterial', function () {
    test('reuses material if new material is cached', function () {
      var system = this.system;
      var oldData = {shader: 'flat', opacity: 1};
      var newData = {shader: 'flat', opacity: 0.5};

      var material1 = system.getOrCreateMaterial(newData);
      var material2 = system.getUpdatedMaterial(newData, oldData);
      assert.equal(material1.uuid, material2.uuid);
    });

    test('creates new material if other entities using material', function () {
      var system = this.system;
      var data1 = {shader: 'flat'};
      var data2 = {shader: 'flat', side: 'double'};
      var hash1 = system.hash(data1);
      var hash2 = system.hash(data2);
      var material1;
      var material2;

      material1 = system.getOrCreateMaterial(data1);
      system.getOrCreateMaterial(data1);
      material2 = system.getUpdatedMaterial(data2);

      assert.equal(system.cache[hash1].material, material1);
      assert.equal(system.cache[hash2].material, material2);
      assert.notEqual(material1.uuid, material2.uuid);
    });

    test('updates material if no other entities are using material', function () {
      var system = this.system;
      var oldData = {shader: 'flat', opacity: 1};
      var newData = {shader: 'flat', opacity: 0.5};
      var oldHash = system.hash(oldData);
      var newHash = system.hash(newData);
      var material1;
      var material2;

      material1 = system.getOrCreateMaterial(oldData);
      assert.equal(material1.opacity, 1);

      material2 = system.getUpdatedMaterial(newData, oldData);

      assert.notOk(system.cache[oldHash]);
      assert.ok(system.cache[newHash]);
      assert.equal(material1.uuid, material2.uuid);
      assert.equal(material1.opacity, 0.5);
    });
  });

  suite('unuseGeometry', function () {
    teardown(function () {
      this.system.clearCache();
    });

    test('disposes material if no longer used', function () {
      var data = {shader: 'flat'};
      var system = this.system;
      var hash = system.hash(data);
      var sinon = this.sinon;

      var material = system.getOrCreateMaterial(data);
      var disposeSpy = sinon.spy(material, 'dispose');
      system.unuseMaterial(data);

      assert.ok(disposeSpy.called);
      assert.notOk(system.cache[hash]);
      assert.notOk(system.cacheCount[hash]);
    });

    test('does not dispose material if still used', function () {
      var data = {shader: 'flat'};
      var system = this.system;
      var hash = system.hash(data);
      var sinon = this.sinon;

      var material = system.getOrCreateMaterial(data);
      var disposeSpy = sinon.spy(material, 'dispose');

      system.getOrCreateMaterial(data);
      system.unuseMaterial(data);
      assert.notOk(disposeSpy.called);
      assert.ok(system.cache[hash]);
      assert.equal(system.cacheCount[hash], 1);
    });
  });
});
