---
title: Building User Interfaces
type: introduction
layout: docs
parent_section: introduction
order: 10
examples: []
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

## Managing Menus with the `state` Component

### Having the Application React to the Menu

### Pagination

## Fading and Sliding Transitions

## Texture Atlasing Images and Icons
