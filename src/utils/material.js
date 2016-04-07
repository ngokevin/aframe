/**
 * Update `material.map` given `data.src`. For standard and flat shaders.
 *
 * @param {object} shader - A-Frame shader instance.
 * @param {object} data
 */
module.exports.updateMap = function (shader, data) {
  var els = shader.els;
  var material = shader.material;
  var src = data.src;

  if (src) {
    if (src === shader.textureSrc) { return; }
    // Texture added or changed.
    shader.textureSrc = src;
    shader.sceneEl.systems.texture.loadTexture(src, {src: src, repeat: data.repeat}, setMap);
    return;
  }

  // Texture removed.
  setMap(null);

  function setMap (texture) {
    material.map = texture;
    material.needsUpdate = true;
    handleTextureEvents(els, texture);
  }
};

/**
 * Emit event on entities on texture-related events.
 *
 * @param {array} els - Array of entities.
 * @param {object} texture - three.js Texture.
 */
function handleTextureEvents (els, texture) {
  if (!texture) { return; }

  els.forEach(function emitTextureLoaded (el) {
    el.emit('material-texture-loaded', {src: texture.image, texture: texture});
  });

  // Video events.
  if (texture.image.tagName !== 'VIDEO') { return; }
  texture.image.addEventListener('loadeddata', function emitVideoTextureLoadedDataAll () {
    els.forEach(function emitVideoTextureLoadedData (el) {
      el.emit('material-video-loadeddata', {src: texture.image, texture: texture});
    });
  });
  texture.image.addEventListener('ended', function emitVideoTextureEndedAll () {
    els.forEach(function emitVideoTextureEnded (el) {
      // Works for non-looping videos only.
      el.emit('material-video-ended', {src: texture.image, texture: texture});
    });
  });
}
module.exports.handleTextureEvents = handleTextureEvents;
