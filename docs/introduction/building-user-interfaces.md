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
[render-order]: https://github.com/supermedium/superframe/tree/master/components/render-order#aframe-render-order-component
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
- **The [render-order component][render-order]**: Lets us define render order
  for transparent objects. Useful for making sure text looks okay when overlayed on
  button and menu backgrounds.

[proxy-event]: https://github.com/supermedium/superframe/tree/master/components/proxy-event#aframe-proxy-event-component
[state]: https://github.com/supermedium/superframe/tree/master/components/state/

As a more advanced topic, we'll also cover using the [state component][state]
to keep track of menu state, toggle menus, and have menu interactions affect
the rest of the application. The [proxy-event component][proxy-event] will
also assist in triggering actions to the state.

[environment]: https://github.com/supermedium/aframe-environment-component/

We'll make a menu that can change the environment with the [environment
component] and also display real-time weather data of various cities fetched
from a free online weather API.

<!--toc-->

## Making the Menu Background

## Making a Button

### Making the Button Background

### Making the Button Text

## Laying Out the Buttons

## Adding Interactivity

### Adding a Hover Effect

### Adding a Click Handler

## Managing Menus with the `state` Component

### Menu State

### Toggling Raycastability and Visibility

### Rendering a List

### Pagination

### Having the Application React to the Menu
