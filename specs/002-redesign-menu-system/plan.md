# Implementation Plan: Redesign Menu System

**Branch**: `002-redesign-menu-system` | **Date**: 2026-10-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-redesign-menu-system/spec.md`

## Summary

Move menu presentation into the existing Three.js scene as configurable fixed-orientation world-space text while preserving the current keyboard navigation state model. Replace the autonomous camera orbit with per-Enter-selection camera transitions that interpolate both position and focus point using each option's duration and easing. Ignore Enter, Delete, and Backspace while a transition is active, while allowing arrow-key highlight changes. Save the current viewpoint on submenu entry and restore it when navigating back. Reveal the root menu after scene readiness and reveal only the newly activated submenu. Use Three.js plane meshes and CanvasTexture-backed labels with pre-rendered blurred and sharp canvases, avoiding additional packages and external font assets.

## Technical Context

**Language/Version**: Browser JavaScript using native ES modules and ES6+ syntax

**Primary Dependencies**: Three.js `^0.166.1`; Vite `^5.4.10` for development and static production build; no new runtime dependency

**Storage**: Static `src/config/config.json`; no server-side or persistent user storage

**Testing**: Node.js built-in test runner for pure menu/camera behavior, `npm run build`, and manual browser validation through Vite

**Target Platform**: Modern desktop browsers with WebGL and Canvas 2D support; static hosting

**Project Type**: Single-project browser application

**Performance Goals**: Maintain a smooth 60 FPS target on the existing desktop scene; avoid per-frame Canvas redraws by preparing label textures before reveal transitions

**Constraints**: Vanilla ES6+, Three.js as the primary 3D runtime, static deployment, no secrets, no frameworks or new external runtime dependencies; preserve arrow/Enter/Delete/Backspace controls

**Scale/Scope**: Existing small nested menu tree, one primary GLTF scene, one active menu level at a time, per-option presentation and optional camera transition configuration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Rationale |
|-----------|------|-----------|
| Browser-first and static deployable | PASS | Scene, menu, configuration, and animation remain client-side and can be hosted as static assets. |
| Vanilla ES6+ | PASS | Existing native module and browser API architecture is retained; no UI framework is introduced. |
| Three.js canonical runtime | PASS | In-scene menu labels, visibility, and camera animation remain in the existing Three.js scene. |
| Security and secret handling | PASS | No secrets, credentials, or private configuration are required. |
| Minimal dependency and simplicity | PASS | Canvas textures, plane meshes, and interpolation use existing browser and Three.js capabilities; no package addition is planned. |

No constitution violations require an exception.

### Post-Design Constitution Re-Check

| Principle | Gate | Design evidence |
|-----------|------|-----------------|
| Browser-first and static deployable | PASS | Config, sprites, texture generation, and camera transitions run in the browser; output remains static-hostable. |
| Vanilla ES6+ | PASS | The design uses native modules and browser canvas APIs without a framework. |
| Three.js canonical runtime | PASS | Menu text objects, scene composition, and camera movement use the existing Three.js scene. |
| Security and secret handling | PASS | The feature requires no secrets or credential-bearing configuration. |
| Minimal dependency and simplicity | PASS | CanvasTexture and plane meshes are existing capabilities; no runtime dependency or separate project is added. |

The completed design remains compliant with every constitutional principle; no exception or unresolved gate remains.

## Project Structure

### Documentation (this feature)

```text
specs/002-redesign-menu-system/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── config-schema.json
└── tasks.md                 # Produced by /speckit-tasks
```

### Source Code (repository root)

```text
index.html
src/
├── main.js                  # Bootstrap, selection routing, and keyboard/menu coordination
├── config/
│   └── config.json          # Text presentation, hierarchy, and optional camera views
├── menu/
│   ├── keyboard.js          # Preserve current key bindings
│   ├── menuState.js         # Preserve path/index traversal
│   └── sceneMenu.js         # New Three.js world-space menu labels and reveal state
├── scene/
│   ├── cameraTransition.js  # New selection-driven camera position/focus interpolation
│   └── initScene.js         # Scene composition, menu attachment, resize, and frame loop
├── style.css                # Retain outer layout/status styling; remove DOM menu presentation
└── utils/
    └── safeConfigLoader.js  # Continue loading the static menu configuration with fallback
```

The current DOM `renderMenu.js` presentation and autonomous `cameraOrbit.js` behavior are replaced by scene menu rendering and selection-driven camera transitions. Existing keyboard and menu-state responsibilities remain separate from rendering. The current Node built-in tests should be extended or moved alongside the pure camera/menu modules without adding a test dependency.

**Structure Decision**: Keep the current single-project `src/` structure and Three.js scene lifecycle. Add narrowly scoped scene-menu and camera-transition modules; update the bootstrap, scene shell, and JSON config to connect them. The user-facing menu labels become world-space scene objects, not DOM list elements.

## Complexity Tracking

No constitution violations or additional project layers are proposed.
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
