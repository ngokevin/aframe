/* global assert, setup, suite, test */
var entityFactory = require('../helpers').entityFactory;

suite('animation', function () {
  var component;
  var el;

  setup(function (done) {
    this.done = false;
    el = entityFactory();
    el.setAttribute('animation', '');
    el.addEventListener('componentinitialized', function (evt) {
      if (evt.detail.name !== 'animation' || this.done) { return; }
      component = el.components.animation;
      this.done = true;
      done();
    });
  });

  suite('basic animation', () => {
    test('sets from value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1});
      component.tick(0, 20);
      assert.equal(el.getAttribute('light').intensity, 0.5);
    });

    test('sets between value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1.0, dur: 500});
      component.tick(0, 100);
      component.tick(0, 100);
      assert.ok(el.getAttribute('light').intensity > 0.5);
      assert.ok(el.getAttribute('light').intensity < 1.0);
    });

    test('sets to value', function () {
      el.setAttribute('animation', {property: 'light.intensity', from: 0.5, to: 1.0, dur: 500});
      component.tick(0, 1);
      component.tick(0, 500);
      assert.equal(el.getAttribute('light').intensity, 1.0);
    });

    test('handles non-truthy from value (i.e., 0)', function () {
      el.setAttribute('text', {value: 'supermedium'});
      el.setAttribute('animation', {
        property: 'components.text.material.uniforms.opacity.value',
        from: 0,
        to: 1,
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.components.text.material.uniforms.opacity.value, 0);
    });

    test('handles non-truthy to value (i.e., 0)', function () {
      el.setAttribute('animation', {
        property: 'object3D.scale.y',
        from: 1,
        to: 0,
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.object3D.scale.y, 1);
      component.tick(0, 1000);
      assert.equal(el.object3D.scale.y, 0);
    });
  });

  suite('direct component value animation', () => {
    test('can animate component value or member directly', function () {
      el.setAttribute('material', 'opacity', 0);
      el.setAttribute('animation', {
        property: 'components.material.material.opacity',
        dur: 1000,
        from: 0,
        to: 1
      });
      component.tick(0, 1);
      assert.equal(el.components.material.material.opacity, 0);
      component.tick(0, 500);
      assert.ok(el.components.material.material.opacity > 0);
      assert.ok(el.components.material.material.opacity < 1.0);
      component.tick(0, 500);
      assert.equal(el.components.material.material.opacity, 1.0);
    });
  });

  suite('direct object3D value animation', () => {
    test('can animate object3D value directly', function () {
      el.setAttribute('animation', {
        property: 'object3D.position.x',
        dur: 1000,
        from: 0,
        to: 10
      });
      component.tick(0, 1);
      assert.equal(el.object3D.position.x, 0);
      component.tick(0, 500);
      assert.ok(el.object3D.position.x > 0);
      assert.ok(el.object3D.position.x < 10);
      component.tick(0, 500);
      assert.equal(el.object3D.position.x, 10);
    });
  });

  suite('color animation', () => {
    test('can animate color object directly', function () {
      el.setAttribute('material', '');
      el.setAttribute('animation', {
        property: 'components.material.material.color',
        dur: 1000,
        from: 'blue',
        to: 'red',
        type: 'color'
      });
      component.tick(0, 1);
      assert.equal(el.components.material.material.color.b, 1);
      assert.equal(el.components.material.material.color.r, 0);
      component.tick(0, 500);
      assert.ok(el.components.material.material.color.b > 0);
      assert.ok(el.components.material.material.color.b < 1);
      assert.ok(el.components.material.material.color.r > 0);
      assert.ok(el.components.material.material.color.r < 1);
      component.tick(0, 500);
      assert.equal(el.components.material.material.color.b, 0);
      assert.equal(el.components.material.material.color.r, 1);
    });
  });

  suite('dir (direction)', () => {
    test('can reverse', function () {
      el.setAttribute('animation', {
        property: 'light.intensity',
        from: 0.5,
        to: 1,
        dir: 'reverse',
        dur: 1000
      });
      component.tick(0, 1);
      assert.equal(el.getAttribute('light').intensity, 1.0);
      component.tick(0, 500);
      assert.ok(el.getAttribute('light').intensity < 1.0);
      assert.ok(el.getAttribute('light').intensity > 0.5);
      component.tick(0, 500);
      assert.equal(el.getAttribute('light').intensity, 0.5);
    });
  });

  suite('startAnimation', function () {
    test('plays by default', function () {
      el.setAttribute('animation', {property: 'position'});
      assert.ok(component.animationIsPlaying);
    });

    test('plays on delay', function (done) {
      el.setAttribute('animation', {property: 'position', delay: 100});
      assert.notOk(component.animationIsPlaying);
      setTimeout(() => {
        assert.ok(component.animationIsPlaying);
        done();
      }, 100);
    });

    test('does not play if startEvents', function () {
      el.setAttribute('animation', {property: 'position', startEvents: 'foo'});
      assert.notOk(component.animationIsPlaying);
    });

    test('does not play if not autoplay', function () {
      el.setAttribute('animation', {property: 'position', autoplay: false});
      assert.notOk(component.animationIsPlaying);
    });
  });

  suite('event listeners', () => {
    test('plays on startEvents', function (done) {
      el.setAttribute('animation', {property: 'position', startEvents: ['foo', 'far']});
      assert.notOk(component.animationIsPlaying);
      el.addEventListener('foo', function () {
        assert.ok(component.animationIsPlaying);
        done();
      });
      el.emit('foo');
    });

    test('restarts animation on startEvents', function (done) {
      el.setAttribute('animation', {
        property: 'object3D.scale.z',
        from: 1,
        to: 2,
        startEvents: ['foo', 'foo2']
      });

      el.addEventListener('foo', function () {
        assert.ok(component.animationIsPlaying);
        assert.equal(el.object3D.scale.z, 1);
        component.tick(0, 1);
        component.tick(0, 550);
        assert.ok(el.object3D.scale.z > 1);
        el.emit('foo2');
      });

      el.addEventListener('foo2', function () {
        component.tick(0, 1);
        assert.ok(component.animationIsPlaying);
        assert.equal(el.object3D.scale.z, 1);
        component.tick(0, 550);
        assert.ok(el.object3D.scale.z > 1);
        done();
      });

      component.tick(0, 1);
      component.tick(0, 500);
      el.emit('foo');
    });

    test('pauses on pauseEvents', function (done) {
      el.setAttribute('animation', {property: 'position', pauseEvents: 'bar boo'});
      assert.ok(component.animationIsPlaying);
      el.addEventListener('bar', function () {
        assert.notOk(component.animationIsPlaying);
        done();
      });
      el.emit('bar');
    });

    test('resumes on resumeEvents', function (done) {
      el.setAttribute('text', {opacity: 0, value: 'supermedium'});
      el.setAttribute('animation', {
        property: 'components.text.material.uniforms.opacity.value',
        from: 0,
        to: 1,
        dur: 1000,
        pauseEvents: 'bar',
        resumeEvents: 'qux'
      });
      el.addEventListener('bar', function () {
        assert.notOk(component.animationIsPlaying);
        el.emit('qux');
      });
      el.addEventListener('qux', function () {
        assert.ok(component.animationIsPlaying);
        assert.ok(el.components.text.material.uniforms.opacity.value > 0, 'More than 0');
        assert.ok(el.components.text.material.uniforms.opacity.value < 1, 'Less than 1');
        component.tick(0, 500);
        assert.equal(el.components.text.material.uniforms.opacity.value, 1);
        done();
      });

      assert.ok(component.animationIsPlaying, 'Should be playing');
      component.tick(0, 1);
      component.tick(0, 500);
      assert.ok(el.components.text.material.uniforms.opacity.value > 0, 'More than 0');
      assert.ok(el.components.text.material.uniforms.opacity.value < 1, 'Less than 1');
      el.emit('bar');
    });
  });

  suite('event emissions', function () {
    test('emits animationbegin event', function (done) {
      el.addEventListener('animationbegin', evt => { done(); });
      el.setAttribute('animation', {property: 'position', to: '2 2 2'});
    });

    test('emits animationcomplete event', function (done) {
      el.addEventListener('animationbegin', evt => {
        el.addEventListener('animationcomplete', evt => { done(); });
        component.tick(1, 1);
        component.tick(100000, 99999);
      });
      el.setAttribute('animation', {property: 'position', to: '2 2 2'});
    });

    test('emits animationcomplete event twice', function (done) {
      var calledOnce = false;
      el.addEventListener('animationbegin', evt => {
        component.tick(1, 1);
        component.tick(100000, 99999);
      });

      el.addEventListener('animationcomplete', evt => {
        if (calledOnce) {
          done();
        } else {
          calledOnce = true;
          component.el.emit('startAnimation');
        }
      });

      el.setAttribute('animation', {
        property: 'position',
        to: '2 2 2',
        startEvents: 'startAnimation'
      });
      component.el.emit('startAnimation');
    });
  });

  suite('tick', function () {
    test('only calls animejs animation.tick if playing', function () {
      el.setAttribute('animation', 'property', 'position');
      let animationTickSpy = this.sinon.spy(component.animation, 'tick');
      component.animationIsPlaying = false;
      component.tick(0, 10);
      assert.notOk(animationTickSpy.called);
      component.animationIsPlaying = true;
      component.tick(0, 10);
      assert.ok(animationTickSpy.called);
      assert.equal(animationTickSpy.getCalls()[0].args[0], 10);
    });
  });

  suite('remove', function () {
    test('stops animation', function () {
      el.setAttribute('animation', {property: 'position'});
      assert.ok(component.animationIsPlaying);
      el.removeAttribute('animation');
      assert.notOk(component.animationIsPlaying);
    });
  });
});
