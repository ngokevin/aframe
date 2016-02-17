---
title: collada-model
type: components
layout: docs
parent_section: components
order: 6
---

The `collada-model` component loads a 3D model using a [COLLADA](https://en.wikipedia.org/wiki/COLLADA) (.DAE) file.

## Example

We can load a COLLADA model by pointing to an asset that specifies the `src` to a COLLADA file.

```html
<a-scene>
  <a-assets>
    <a-asset-item id="tree" src="/path/to/tree.dae"></a-asset-item>
  </a-assets>

  <a-entity collada-model="#tree"></a-entity>
</a-scene>
```

### Loading Inline

We can also load a COLLADA model by specifying the path directly within `url()`. Note this is less performant than going through the asset management system.

```html
<a-entity collada-model="url(/path/to/tree.dae)"></a-entity>
```

## Possible Values

| Type     | Description                             |
|----------+-----------------------------------------|
| selector | Selector to an `<a-asset-item>`         |
| string   | `url()`-enclosed path to a COLLADA file |

## Caveats

The three.js COLLADA loader is not very performant. If possible, use a .OBJ file with the [obj-model](obj-model.html) component. A-Frame is looking to support the [GLTF format](https://github.com/aframevr/aframe/issues/819) in the future.
