# Research: Redesign Menu System

## In-Scene Text Rendering

**Decision**: Render labels as fixed-orientation, world-positioned textured planes using CanvasTexture-backed canvases prepared from the configured label and visual size. Parent the menu group to the model's scene group so scene transforms are inherited, and apply each option's configured XYZ Euler rotation in degrees without camera billboarding.

**Rationale**: Textured planes and CanvasTexture are available through the existing Three.js/browser stack. Planes keep their authored orientation as the camera moves, while parent transforms and per-label Euler values keep their scene alignment intentional. Canvas rendering also prepares blurred and sharp visual states without an HTML overlay, new package, or external font asset.

**Alternatives considered**:
- `THREE.Sprite` automatically faces the camera, which conflicts with labels staying fixed in the scene as the camera moves.
- `TextGeometry` produces extruded mesh lettering but requires loading and bundling a font asset, adds geometry and material management, and makes smooth blur reveals more involved.
- DOM/CSS text is straightforward to style but remains an overlay rather than a scene object and does not naturally participate in the scene's 3D composition.

## Menu Navigation and Rendering Boundary

**Decision**: Reuse `createMenuState` and `bindKeyboardControls` as the source of hierarchy and keyboard behavior. Replace the DOM list renderer with a scene-menu renderer that projects current menu state into Three.js labels and selection styling.

**Rationale**: The current state module already supports active paths, wrapping arrow navigation, Enter selection, selectable Back entries, and Delete/Backspace. Keeping state independent of its renderer minimizes behavioral regression risk.

**Alternatives considered**:
- Rewriting navigation inside the scene renderer would couple keyboard rules to visual objects and duplicate existing state behavior.
- Keeping the visible DOM list would not satisfy the in-scene menu requirement.

## Blur-In Reveal

**Decision**: Prepare blurred and sharp label canvases before reveal, then crossfade their sprite materials over a short configurable-by-implementation reveal duration. Create the root reveal after both config and scene are ready; reveal only the active submenu after it is entered.

**Rationale**: Pre-rendering avoids redrawing CanvasTexture content on every animation frame. It provides a blur-to-sharp effect without adding a post-processing stack or dependency. Inactive menu levels remain hidden and are not keyboard-selectable.

**Alternatives considered**:
- Per-frame canvas filter updates could provide continuous blur control but create unnecessary CPU texture uploads.
- Post-processing blur would affect more of the scene than the labels and add rendering complexity.
- Opacity-only fade is less faithful to the specified blur-in reveal.

## Selection-Driven Camera Motion

**Decision**: Replace the autonomous repeating orbit with a stateful camera transition driven from the existing render loop. Per-option configuration supplies destination position, focus point, duration, and an allowlisted easing name (`linear` or `easeInOut`). Interpolate camera position and focus point together. Start a transition only on Enter selection; while one is active, ignore Enter, Delete, and Backspace until it finishes. Arrow-key highlighting may continue during motion. Save the current camera viewpoint when entering a submenu and restore it when leaving through Delete, Backspace, or the submenu's Back option once no transition is active.

After the initial home pose and each completed transition, apply a configurable low-amplitude sinusoidal position offset along one selected axis. Keep the focus point fixed and restart the oscillation phase at zero after each transition.

**Rationale**: Selection-associated destinations map directly to the requested behavior, preserve smooth motion, and do not need an animation dependency. Ignoring confirmation and back inputs avoids overlapping transitions and gives each configured camera move a predictable duration. Restoring the saved parent view makes submenu navigation reversible and consistent across both back controls.

**Alternatives considered**:
- Continuing the autonomous orbit would compete with selection destinations and continue moving the camera after choices.
- A third-party tweening library is unnecessary for the small set of position/focus/easing operations and would expand dependencies.
- Snapping to destinations would ignore the requested configurable camera animation.
- Interrupting or queueing an active transition would replace or defer user intent unpredictably; both are rejected because confirmation and back inputs are ignored until completion.

## Configuration Contract and Validation

**Decision**: Extend the existing nested menu JSON shape with optional presentation data (`position`, `size`) and optional camera view data (`position`, `focus`, and transition settings). Preserve current action metadata and Back node behavior. Document the accepted shape in a JSON Schema contract; invalid optional camera data must not prevent otherwise valid menu content from loading.

**Rationale**: The repository already uses a JSON tree and separate config loading. Optional fields preserve a straightforward migration path and allow nodes without camera movement, as specified.

**Alternatives considered**:
- Replacing the hierarchy with a parallel scene-only menu structure would duplicate labels and introduce synchronization problems.
- Making camera configuration mandatory for every item conflicts with the specified behavior for options without camera settings.

## Validation Approach

**Decision**: Use Node's built-in test runner for pure navigation, configuration, reveal-state, and camera-transition behavior; use the existing Vite production build and manual browser scenarios for rendering and keyboard interaction.

**Rationale**: Node's test runner requires no new dependency. Browser validation is needed for actual WebGL text appearance, perspective, blur, and resize behavior that unit checks cannot prove.

**Alternatives considered**:
- Adding a browser automation framework is outside the feature's minimal-dependency requirement and is not necessary for the first implementation pass.

## Resolved Questions

- Root labels reveal automatically once the config and 3D scene are ready; no pointer action is needed.
- The initial camera remains fixed until a selected option defines a destination.
- A menu item without camera configuration leaves the current camera pose unchanged.
- Back navigation restores the parent menu level and the camera viewpoint saved when entering the active submenu, whether invoked by Delete, Backspace, or the submenu's Back option.
- Camera motion starts only after Enter selects an option; arrow-key highlighting alone never moves the camera.
- During a camera transition, Enter, Delete, and Backspace are ignored until the move finishes; arrow-key highlighting may still update.
- Entering a submenu saves the current camera viewpoint; returning to its parent restores that saved viewpoint.