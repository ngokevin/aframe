/* global HTMLElement */
var ANode = require('./a-node');
var registerElement = require('./a-register-element').registerElement;
var components = require('./component').components;

/**
 * @member {object} componentAttrCache - Cache of pre-parsed values. An object where the keys
 *         are component names and the values are already parsed by the component.
 */
module.exports = registerElement('a-mixin', {
  prototype: Object.create(ANode.prototype, {
    createdCallback: {
      value: function () {
        this.componentAttrCache = {};
        this.id = this.getAttribute('id');
      }
    },

    attributeChangedCallback: {
      value: function (attr, oldVal, newVal) {
        this.cacheAttribute(attr, newVal);
      }
    },

    attachedCallback: {
      value: function () {
        this.sceneEl = this.closest('a-scene');

        this.cacheAttributes();
        this.load();
        this.refreshEntities();
      }
    },

    setAttribute: {
      value: function (attr, value) {
        this.cacheAttribute(attr, value);
        HTMLElement.prototype.setAttribute.call(this, attr, value);
      }
    },

    cacheAttribute: {
      value: function (attr, value) {
        var component = components[attr];
        if (!component) { return; }
        value = value === undefined ? HTMLElement.prototype.getAttribute.call(this, attr) : value;
        this.componentAttrCache[attr] = component.parseAttrValueForCache(value);
      }
    },

    getAttribute: {
      value: function (attr) {
        return this.componentAttrCache[attr] || HTMLElement.prototype.getAttribute.call(this, attr);
      }
    },

    /**
     * Update cache of parsed component attributes.
     */
    cacheAttributes: {
      value: function () {
        var attributes = this.attributes;
        var attrName;
        var i;
        for (i = 0; i < attributes.length; i++) {
          attrName = attributes[i].name;
          this.cacheAttribute(attrName);
        }
      }
    },

    /**
     * For entities that already have been loaded by the time the mixin was attached, tell
     * those entities to register the mixin and refresh their component data.
     */
    refreshEntities: {
      value: function () {
        var entities = this.sceneEl.querySelectorAll('[mixin~=' + this.id + ']');
        for (var i = 0; i < entities.length; i++) {
          var entity = entities[i];
          if (!entity.hasLoaded) { continue; }
          entity.registerMixin(this.id);
          entity.updateComponents();
        }
      }
    }
  })
});
