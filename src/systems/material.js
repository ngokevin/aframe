var registerSystem = require('../core/system').registerSystem;
var shaders = require('../core/shader').shaders;
var THREE = require('../lib/three');

/**
 * System for material component.
 * Handle material creation, material caching, material updates, interfacing with texture
 * system, entity subscription to shader events.
 *
 * @member {object} cache - Mapping of stringified component data to THREE.Material objects.
 * @member {object} cacheCount - Keep track of number of entities using a material to
 *         know whether to dispose on removal.
 * @member {object} nonCachedMaterials - Materials not kept in the cache, but are registered
 *         in order to apply material updates such in case of fog.
 */
module.exports.System = registerSystem('material', {
  init: function () {
    this.cache = {};
    this.cacheCount = {};
    this.nonCachedShaders = {};
  },

  /**
   * Reset cache. Mainly for testing.
   */
  clearCache: function () {
    this.init();
  },

  /**
   * Attempt to retrieve from cache. Create material if it doesn't exist.
   *
   * @returns {Object|null} A material if it exists, else null.
   * @param {Element} el - To subscribe entity to shader for events.
   */
  getOrCreateMaterial: function (data, el) {
    var cache = this.cache;
    var cachedShader;
    var material;
    var shader;
    var hash;

    // Skip all caching logic. Keep track of material to handle updates.
    if (data.skipCache) {
      shader = createShader(this.sceneEl, data);
      shader.subscribeEl(el);
      material = shader.material;
      // Use UUID since these are non-cached, we can have "duplicate" materials.
      this.nonCachedShaders[material.uuid] = shader;
      return shader.material;
    }

    // Try to retrieve from cache first.
    hash = this.hash(data);
    cachedShader = cache[hash];
    incrementCacheCount(this.cacheCount, hash);

    if (cachedShader) {
      cachedShader.subscribeEl(el);
      return cachedShader.material;
    }

    // Create material, cache, and return.
    cachedShader = createShader(this.sceneEl, data);
    cachedShader.subscribeEl(el);
    cache[hash] = cachedShader;
    return cachedShader.material;
  },

  /**
   * Material shader type did not change, but other properties did.
   *
   * If other entities are using the current material, then get/create a new material.
   *
   * If there is an entry in the cache for the updated material data, use that.
   *
   * If other entities are NOT using the current material, update it in-place. Do not dispose
   * of it since we can re-use it.
   *
   * @param {object} data - Updated data.
   * @param {object} oldData - Previous version of data, used to look up the cache whether
   *        we dispose of the old material or reuse it.
   * @param {Element} el - To subscribe entity to shader for events.
   */
  getUpdatedMaterial: function (data, oldData, el) {
    var cache = this.cache;
    var cacheCount = this.cacheCount;
    var hash = this.hash(data);
    var oldHash = this.hash(oldData);
    var shader;

    // Material with new data found in cache.
    // Let `unuseMaterial` decide whether to expose, and return cached material.
    if (cache[hash]) {
      this.unuseMaterial(oldHash, el);
      return cache[hash].material;
    }

    // Material with old data will no longer be used.
    if (cacheCount[oldHash] - 1 === 0) {
      // Update the current material and change the cache reference to new data.
      shader = cache[hash] = cache[oldHash];
      cacheCount[hash] = cacheCount[oldHash];
      delete cache[oldHash];
      delete cacheCount[oldHash];
      updateBaseMaterial(shader.material, data);
      shader.update(data);
      return shader.material;
    }

    // Create new material if updating the material will affect other entities using it.
    return this.getOrCreateMaterial(data, el);
  },

  /**
   * Create hash to uniquely identify data and one-to-one map to materials.
   */
  hash: function (data) {
    return JSON.stringify(data);
  },

  /**
   * Dispose of material if necessary. Update cache count.
   */
  unuseMaterial: function (data, el) {
    var cache = this.cache;
    var cacheCount = this.cacheCount;
    var hash = this.hash(data);

    if (!cache[hash] || data.skipCache) { return; }

    decrementCacheCount(cacheCount, hash);

    // Another entity is still using this material. No need to do anything but unsubscribe.
    if (cacheCount[hash] > 0) {
      cache[hash].unsubscribeEl(el);
      return;
    }

    // No more entities are using this material. Dispose.
    cache[hash].material.dispose();
    delete cache[hash];
    delete cacheCount[hash];
  },

  /**
   * Trigger update to all materials.
   */
  needsUpdate: function () {
    triggerNeedsUpdate(this.cache);
    triggerNeedsUpdate(this.nonCachedShaders);

    function triggerNeedsUpdate (shaders) {
      Object.keys(shaders).forEach(function setNeedsUpdate (key) {
        shaders[key].material.needsUpdate = true;
      });
    }
  }
});

/**
 * Create geometry using component data.
 *
 * @param {object} data - Component data.
 * @returns {object} Geometry.
 */
function createShader (sceneEl, data) {
  var shaderInstance;
  var shaderName = data.shader;
  var ShaderClass = shaders[shaderName] && shaders[shaderName].Shader;

  if (!ShaderClass) { throw new Error('Unknown shader `' + shaderName + '`'); }

  shaderInstance = new ShaderClass(sceneEl);
  shaderInstance.init(data);
  updateBaseMaterial(shaderInstance.material, data);
  return shaderInstance;
}

function decrementCacheCount (cacheCount, hash) {
  cacheCount[hash]--;
}

function incrementCacheCount (cacheCount, hash) {
  cacheCount[hash] = cacheCount[hash] === undefined ? 1 : cacheCount[hash] + 1;
}

/**
 * Update base material properties that are present among all types of materials.
 *
 * @param {object} material
 * @param {object} data
 */
function updateBaseMaterial (material, data) {
  material.side = parseSide(data.side);
  material.opacity = data.opacity;
  material.transparent = data.transparent !== false || data.opacity < 1.0;
  material.depthTest = data.depthTest !== false;
}

/**
 * Returns a three.js constant determining which material face sides to render
 * based on the side parameter (passed as a component property).
 *
 * @param {string} [side=front] - `front`, `back`, or `double`.
 * @returns {number} THREE.FrontSide, THREE.BackSide, or THREE.DoubleSide.
 */
function parseSide (side) {
  switch (side) {
    case 'back': {
      return THREE.BackSide;
    }
    case 'double': {
      return THREE.DoubleSide;
    }
    default: {
      // Including case `front`.
      return THREE.FrontSide;
    }
  }
}
