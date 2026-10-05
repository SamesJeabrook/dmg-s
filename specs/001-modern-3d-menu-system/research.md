# Research: Modern 3D Menu System

## Decision

- Use a single-page Vite project with vanilla ES6 JavaScript and Three.js for the 3D scene.
- Keep the menu configuration in a separate `config.json` file with a nested tree structure.
- Implement keyboard-driven navigation with Enter to select and Delete/Back to return to the parent context.
- Build as a static front-end that renders one HTML entry point and ships static assets for deployment.

## Rationale

The feature requirements explicitly prohibit frameworks and require a static deployable implementation. Vite supports rapid development and production bundling without forcing a framework, while Three.js matches the requirement to render the Mesy_AI_Racing_Simulator asset and support a slow camera orbit. A JSON-driven menu tree keeps the UI configurable without hard-coding menu content, and a back action represented as a selectable option preserves a consistent keyboard interaction model.

## Alternatives considered

- React + Three.js ecosystem: rejected because the project requires a vanilla approach and static deployment without unnecessary framework overhead.
- Server-rendered UI or backend-driven menu state: rejected because the project must stay static and deliver a single HTML build output.
- Hard-coded menu structures in JavaScript: rejected because the requirement explicitly calls for configuration in a separate JSON file.
- Multiple HTML pages: rejected because the brief calls for a single static entry point and a cohesive cinematic experience.

## Open decisions resolved

- The runtime model is browser-based and does not require a backend.
- The menu structure is hierarchical and config-driven.
- The 3D model asset is expected to be loaded from the local `assets` directory.
- Ultra-wide presentation is handled via CSS layout and camera composition rather than a framework-specific layout system.
- Manual validation is sufficient because the project explicitly does not require automated tests.
