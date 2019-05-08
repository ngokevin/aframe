---
title: Building User Interfaces
type: introduction
layout: docs
parent_section: introduction
order: 10
examples:
 - title: Menu Example
   src: https://glitch.com/edit/#!/aframe-building-ui?path=index.html:1:0
---

This guide will cover building 2D user interfaces (UI) such as menus and
buttons. It'll be an ongoing work-in-progress as our best practices for
building UI with A-Frame evolve as more components, abstractions, and UI
systems come out in the future.

[animation]: ../components/animation.md
[slice9]: https://github.com/fernandojsg/aframe-slice9-component
[text]: ../components/text.md

Building UI in WebGL cannot make use of normal HTML and CSS. We must do it
within the context of 3D (which is rendered by shaders under the hood).
Fortunately, we can make use of a few components to help us build good-looking
menus, buttons, and widgets:

- **The built-in [text component][text]**: Renders sharp 2D text.
- **The built-in [animation component][animation]**: Provides hover and
  transition effects.
- **The [slice9 component][slice9]**: Renders curved planes that scales to any
  size without degrading the edges, useful for menu and button backgrounds and
  panels.
- **The [layout component][layout]**: Arranges a list of entities in rows or
  columns (or even other shapes like circles, spheres) without needing to
  manually position them.

[state]: https://github.com/supermedium/superframe/tree/master/components/state/

As an advanced topic, we'll also cover using the [state component][state] to
keep track of menu state and have menu interactions affect the rest of the
application.

<!--toc-->

Let's start by making a simple menu that has three buttons `New Game`, `Load
Game,` and `Settings`.

## Making the Menu Background

## Making a Button

### Making the Button Background

### Making the Button Text

## Laying Out the Buttons

### Optional: Merging the Text

## Adding Interactivity

### Adding a Hover Effect

### Adding a Click Handler

## Hand-Attached Menus

## Managing Menus with the `state` Component

### Having the Application React to the Menu

### Pagination

## Fading and Sliding Transitions

## Texture Atlasing Images and Icons

```
<html>
  <head>
    <title>Building User Interfaces</title>
    <!-- <script src="https://zz.ngrok.io/dist/aframe-master.js"></script> -->
    <script src="https://aframe.io/releases/0.9.2/aframe.min.js"></script>
    <script src="https://unpkg.com/aframe-slice9-component@1.0.0/dist/aframe-slice9-component.min.js"></script>
    <script src="https://unpkg.com/aframe-layout-component@5.3.0/dist/aframe-layout-component.min.js"></script>
    <script src="render-order.js"></script>
    <script>
      AFRAME.registerComponent('raycastable', {});
    </script>
  </head>
  <body>
    <a-scene background="color: #FAFAFA" render-order="menuBackground, button">
      <a-assets>
        <img id="sliceImg" src="https://cdn.glitch.com/0ddef241-2c1a-4bc2-8d47-58192c718908%2Fslice.png?1557308835598">
        <img id="logo" src="https://cdn.glitch.com/0ddef241-2c1a-4bc2-8d47-58192c718908%2Fsymbol-transparent.png?1557312318582">
        <a-mixin id="font" text="font: roboto"></a-mixin>
        <a-mixin id="slice" slice9="color: #050505; transparent: true; opacity: 0.9; src: #sliceImg; left: 50; right: 52; top: 50; bottom: 52; padding: 0.15"></a-mixin>

        <a-mixin id="buttonBackground" mixin="slice" slice9="width: 1.3; height: 0.3; color: #DADADA" raycastable position="0 0 0.01" render-order="button"></a-mixin>
        <a-mixin
          id="buttonHoverEffect"
          animation__mouseenter="property: components.slice9.material.color; type: color; from: #DADADA; to: #FAFAFF; easing: easeOutCubic; dur: 150; startEvents: mouseenter"
          animation__mouseleave="property: components.slice9.material.color; type: color; from: #FAFAFF; to: #DADADA; easing: easeOutCubic; dur: 150; startEvents: mouseleave"></a-mixin>
        <a-mixin id="buttonText" mixin="font" text="align: center; width: 2.5; zOffset: 0.01; color: #333"></a-mixin>
        <a-mixin id="button" mixin="buttonBackground buttonHoverEffect buttonText"></a-mixin>
      </a-assets>

      <a-entity id="menu" position="0 1.4 -4">
        <a-entity id="menuBackground" mixin="slice" slice9="height: 3; width: 2" render-order="menuBackground"></a-entity>

        <a-entity id="title" text="value: Super Menu; color: #FAFAFA; width: 4; align: center" position="0 1.2 0.01"></a-entity>

        <a-entity id="logo" geometry="primitive: plane; width: 0.7; height: 0.7" material="src: #logo; transparent: true" position="0 0.65 0"></a-entity>

        <a-entity id="buttons" layout="type: box; columns: 1; marginRow: -0.5">
          <a-entity mixin="button" text="value: New Game"></a-entity>
          <a-entity mixin="button" text="value: Load Game"></a-entity>
          <a-entity mixin="button" text="value: Settings"></a-entity>
        </a-entity>
      </a-entity>

      <a-entity id="mouseCursor" cursor="rayOrigin: mouse" raycaster="objects: [raycastable]"></a-entity>
    </a-scene>
  </body>
</html>
```
