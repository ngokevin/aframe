/* global assert, setup, suite, test, THREE */
var entityFactory = require('../helpers').entityFactory;

suite.only('text', function () {
  var component;
  var el;

  setup(function (done) {
    el = entityFactory();
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'text') { return; }
      component = el.components.text;
      done();
    });
    el.setAttribute('text', '');
  });

  suite('init', function () {
    test('creates text mesh', function () {
      assert.ok(el.getObject3D('text'));
      assert.ok(el.getObject3D('text') instanceof THREE.Mesh);
      assert.ok(el.getObject3D('text').geometry);
      assert.ok(el.getObject3D('text').material);
    });
  });

  suite('update', function () {
    test('updates geometry with value', function (done) {
      var fontPollInterval;
      var updateGeometrySpy = this.sinon.spy(component.geometry, 'update');
      el.setAttribute('text', 'value', 'foo');
      // NOTE: there are two paths by which geometry update can happen;
      // first, as after-effect of font change;
      // second, as direct effect when no font change.
      // To make this test work reliably,
      // modified text component so order of arguments is same in both cases.
      // If the first case is happening, the call may not be instantaneous,
      // and we would need to wait until the font is loaded.
      this.timeout(3000);
      fontPollInterval = setInterval(function () {
        if (component.currentFont) {
          assert.equal(updateGeometrySpy.getCalls()[0].args[0].value, 'foo');
          clearInterval(fontPollInterval);
          done();
        }
      }, 1);
    });

    test('calls createOrUpdateMaterial if shader changes', function () {
      var updateMaterialSpy = this.sinon.spy(component, 'createOrUpdateMaterial');
      el.setAttribute('text', 'shader', 'sdf');
      assert.shallowDeepEqual(updateMaterialSpy.getCalls()[0].args[0],
                              {shader: 'modifiedsdf'});
      el.setAttribute('text', 'shader', 'msdf');
      assert.shallowDeepEqual(updateMaterialSpy.getCalls()[1].args[0],
                              {shader: 'sdf'});
    });
  });

  suite('createOrUpdateMaterial', function () {
    suite('modifiedsdf', function () {
      test('updates material color', function () {
        var value;
        value = el.getObject3D('text').material.uniforms.color.value;
        assert.equal(new THREE.Color(value.x, value.y, value.z).getHexString(), 'ffffff');
        el.setAttribute('text', 'color', '#123456');
        value = el.getObject3D('text').material.uniforms.color.value;
        assert.equal(new THREE.Color(value.x, value.y, value.z).getHexString(), '123456');
      });

      test('updates material opacity', function () {
        var value;
        value = el.getObject3D('text').material.uniforms.opacity.value;
        assert.equal(value, 1);
        el.setAttribute('text', 'opacity', '0.55');
        value = el.getObject3D('text').material.uniforms.opacity.value;
        assert.equal(value, 0.55);
      });

      test('updates material side', function () {
        var value;
        value = el.getObject3D('text').material.side;
        assert.equal(value, THREE.FrontSide);
        el.setAttribute('text', 'side', 'double');
        value = el.getObject3D('text').material.side;
        assert.equal(value, THREE.DoubleSide);
      });
    });

    suite('msdf', function () {
      setup(function () {
        el.setAttribute('text', 'shader', 'msdf');
      });

      test('updates material color', function () {
        var value;
        value = el.getObject3D('text').material.uniforms.color.value;
        assert.equal(new THREE.Color(value.r, value.g, value.b).getHexString(), 'ffffff');
        el.setAttribute('text', 'color', '#123456');
        value = el.getObject3D('text').material.uniforms.color.value;
        assert.equal(new THREE.Color(value.r, value.g, value.b).getHexString(), '123456');
      });

      test('updates material opacity', function () {
        var value;
        value = el.getObject3D('text').material.uniforms.opacity.value;
        assert.equal(value, 1);
        el.setAttribute('text', 'opacity', '0.55');
        value = el.getObject3D('text').material.uniforms.opacity.value;
        assert.equal(value, 0.55);
      });

      test('updates material side', function () {
        var value;
        value = el.getObject3D('text').material.side;
        assert.equal(value, THREE.FrontSide);
        el.setAttribute('text', 'side', 'double');
        value = el.getObject3D('text').material.side;
        assert.equal(value, THREE.DoubleSide);
      });
    });
  });

  suite('remove', function () {
    test('removes mesh', function () {
      el.parentNode.removeChild(el);
      assert.notOk(el.getObject3D('text'));
    });

    test('cleans up', function () {
      var geometryDisposeSpy = this.sinon.spy(component.material, 'dispose');
      var materialDisposeSpy = this.sinon.spy(component.geometry, 'dispose');
      var textureDisposeSpy = this.sinon.spy(component.texture, 'dispose');

      el.parentNode.removeChild(el);

      assert.notOk(component.geometry);
      assert.notOk(component.material);
      assert.notOk(component.texture);

      assert.ok(geometryDisposeSpy.called);
      assert.ok(materialDisposeSpy.called);
      assert.ok(textureDisposeSpy.called);
    });
  });
});
