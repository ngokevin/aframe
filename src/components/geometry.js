var geometries = require('../core/geometry').geometries;
var registerComponent = require('../core/component').registerComponent;
var THREE = require('../lib/three');

var dummyGeometry = new THREE.Geometry();

/**
 * Geometry component. Combined with material component to make a mesh in 3D object.
 * Extended with registered geometries.
 */
module.exports.Component = registerComponent('geometry', {
  schema: {
    buffer: {default: true},
    primitive: {default: ''},
    useCache: {default: true}
  },

  /**
   * Talk to geometry system to get or create geometry.
   */
  update: function (previousData) {
    var data = this.data;
    var mesh = this.el.getOrCreateObject3D('mesh', THREE.Mesh);
    var system = this.system;

    if (mesh.geometry) { system.unuseGeometry(data); }
    mesh.geometry = system.getOrCreateGeometry(data);
  },

  /**
   * Tell geometry system that entity is no longer using the geometry.
   * Unset the geometry on the mesh
   */
  remove: function () {
    this.system.unuseGeometry(this.data);
    this.el.getObject3D('mesh').geometry = dummyGeometry;
  },

  /**
   * Update geometry component schema based on geometry type.
   *
   * @param {object} data - New data passed by Component.
   */
  updateSchema: function (data) {
    var newGeometryType = data.primitive;
    var currentGeometryType = this.data && this.data.primitive;
    var schema = geometries[newGeometryType] && geometries[newGeometryType].schema;

    // Geometry has no schema.
    if (!schema) { throw new Error('Unknown geometry schema `' + newGeometryType + '`'); }
    // Nothing has changed.
    if (currentGeometryType && currentGeometryType === newGeometryType) { return; }

    this.extendSchema(schema);
  }
});
