---
description: "Implementation tasks for the in-scene 3D menu redesign"
---

# Tasks: Redesign Menu System

**Input**: Design documents from `specs/002-redesign-menu-system/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/config-schema.json`, `quickstart.md`

**Organization**: Tasks are grouped by user story to support incremental delivery and validation. No separate automated-test tasks are included because the feature spec does not request them.

**Task format**: `- [ ] [TaskID] [P?] [Story?] Description with file path`

## Phase 1: Setup

**Purpose**: The existing Vite/Three.js project and build entry points are already initialized. No project setup changes or new dependencies are required.

## Phase 2: Foundational Configuration

**Purpose**: Provide one normalized, validated menu tree for all scene rendering and interaction stories.

- [X] T001 Add recursive menu configuration normalization and validation in `src/menu/menuConfig.js`: require non-empty `id` and `label`, sibling-unique IDs, positive `presentation.size`, finite XYZ coordinates, both `camera.position` and `camera.focus` when `camera` is present, reject or ignore a camera view whose focus equals its destination position, require non-negative transition duration, and limit easing to `linear` or `easeInOut`; preserve legacy nodes with omitted optional fields and treat groups with no children as non-navigable leaves.
- [X] T002 Integrate the normalizer in `src/utils/safeConfigLoader.js` so fetched or fallback configuration is validated and invalid optional camera/presentation data cannot break otherwise usable menu content.

**Checkpoint**: All stories can consume a consistent existing or extended menu tree without new packages.

---

## Phase 3: User Story 1 - Navigate the In-Scene Menu (Priority: P1) 🎯 MVP

**Goal**: Present menu choices as selectable 3D scene options and preserve arrow, Enter, Delete, and Backspace navigation.

**Independent Test**: Start the app, wait for root options, navigate with Up/Down, open a group with Enter, then return using Delete/Backspace and the selectable Back option. Confirm the active choice is visually identifiable and no DOM menu list is shown.

- [X] T003 [US1] Replace the separate DOM menu panel with a scene-first mount and retain the on-screen controls/status area in `index.html` and `src/style.css`.
- [X] T004 [US1] Create fixed-orientation world-space 3D menu labels using Three.js plane meshes and CanvasTexture in `src/menu/sceneMenu.js`; render active-node children with a readable selected state and fallback layout.
- [X] T005 [US1] Connect `createMenuState`, `bindKeyboardControls`, and the scene menu renderer in `src/main.js` so arrow changes update the highlight, Enter opens groups or invokes actions, and back results return to the parent menu.
- [X] T006 [US1] Remove the obsolete DOM-list rendering implementation from `src/menu/renderMenu.js` and remove only menu-list/panel styling no longer used by the scene menu from `src/style.css`.

**Checkpoint**: Keyboard navigation and nested menus work with the menu represented in the 3D scene.

---

## Phase 4: User Story 2 - Configure In-Scene Menu Presentation (Priority: P1)

**Goal**: Allow each menu option's label, world position, and size to be changed from the menu configuration.

**Independent Test**: Change one option's label, `presentation.position` XYZ values, and positive `presentation.size` in `src/config/config.json`; reload and verify the rendered option reflects all three values without changing keyboard behavior.

- [X] T007 [P] [US2] Extend `specs/002-redesign-menu-system/contracts/config-schema.json` to allow optional node `presentation.position` and `presentation.rotation` as finite XYZ coordinates and `presentation.size` as a positive number while preserving existing nested menu and action/back fields.
- [X] T008 [P] [US2] Add explicit `presentation.position`, `presentation.rotation` in degrees, and positive `presentation.size` values to root menu options and representative nested options in `src/config/config.json`.
- [X] T009 [US2] Apply normalized `presentation.position`, `presentation.rotation` in XYZ degrees, and `presentation.size` to each fixed-orientation label in `src/menu/sceneMenu.js`; use defaults when fields are omitted.

**Checkpoint**: Editing only the menu JSON changes visible option text, placement, and size.

---

## Phase 5: User Story 3 - Move and Aim the Camera Per Selection (Priority: P1)

**Goal**: Move the camera to an option's configured position and focus only on Enter selection, with configurable transitions and predictable input handling.

**Independent Test**: Configure a menu option with camera XYZ position, XYZ focus, duration, and easing; verify arrow browsing does not move the camera, Enter animates to the configured pose, and Enter/Delete/Backspace are ignored during movement while arrows still update the highlight. Entering and leaving a submenu restores its saved prior view.

- [X] T010 [US3] Implement `src/scene/cameraTransition.js` to interpolate camera position and focus, support `linear` and `easeInOut`, apply zero-duration transitions immediately, and expose whether a transition is active.
- [X] T011 [US3] Integrate the camera transition controller with the renderer frame loop and scene lifecycle in `src/scene/initScene.js`; remove the autonomous repeating camera orbit from active scene behavior and expose a selection-driven camera control to the bootstrap.
- [X] T012 [US3] Route Enter-selected node camera settings through `src/main.js`; save the current position and focus when entering a submenu, and restore that saved pose when returning by Delete, Backspace, or the submenu Back option.
- [X] T013 [P] [US3] Update `src/menu/keyboard.js` to accept a transition-busy guard: ignore Enter, Delete, and Backspace while the camera is moving, while allowing Up/Down highlight changes.
- [X] T014 [US3] Ensure `src/menu/menuState.js` and `src/main.js` keep selectable Back-node and key-based back-navigation state synchronized with the camera-view history stack without altering root-level back behavior.

**Checkpoint**: Camera moves only on Enter, follows configured position/focus/transition settings, restores parent views, and blocks confirmation/back inputs during movement.

---

## Phase 6: User Story 4 - Reveal Root and Nested Options (Priority: P2)

**Goal**: Reveal the root menu on load and reveal each submenu only when activated, using a blur-in effect.

**Independent Test**: Reload and confirm labels begin hidden, blur into a readable state after scene/config readiness, and child options stay hidden until their submenu is entered. Return to the parent and confirm inactive child options are hidden and unavailable.

- [X] T015 [US4] Prepare blurred and sharp label canvas textures and implement a blur-to-clear sprite reveal state in `src/menu/sceneMenu.js` without redrawing canvases every animation frame.
- [X] T016 [US4] Start the root-level reveal only after config and scene readiness in `src/main.js` and `src/scene/initScene.js`; keep root options hidden before reveal and enable root keyboard selection once readable.
- [X] T017 [US4] Reveal only the newly active submenu and hide inactive levels on navigation in `src/menu/sceneMenu.js`; gate keyboard availability in `src/menu/keyboard.js` until the active level's reveal completes.

**Checkpoint**: Root and submenu options follow the requested staged blur-in behavior and only active-level options can be selected.

---

## Phase 7: Polish and Cross-Cutting Validation

**Purpose**: Verify the integrated feature and avoid resource leaks while preserving static deployment.

- [X] T018 Dispose generated label textures, materials, and scene objects during scene teardown in `src/menu/sceneMenu.js` and `src/scene/initScene.js`.
- [X] T019 Run all manual scenarios in `specs/002-redesign-menu-system/quickstart.md`, correct any discrepancies in the referenced `src/` files, and confirm `npm run build` from `package.json` produces a static `dist/` output without adding runtime dependencies.

---

## Dependencies and Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks; existing Vite/Three.js project setup is sufficient.
- **Foundational Configuration (Phase 2)**: Must complete before user stories because every story consumes the normalized menu tree.
- **User Story 1 (Phase 3)**: First user-facing increment and MVP; depends on the foundational configuration tasks.
- **User Story 2 (Phase 4)**: Depends on US1's scene menu renderer so its presentation fields can be applied and verified.
- **User Story 3 (Phase 5)**: Depends on US1 navigation integration and US2 camera/presentation configuration shape.
- **User Story 4 (Phase 6)**: Depends on the scene menu renderer and the active-level lifecycle from US1; implement after US3 to avoid overlapping keyboard and scene lifecycle edits.
- **Polish (Phase 7)**: Depends on the desired user stories being integrated.

### User Story Dependencies

- **US1 (P1)**: Depends on the foundational normalizer/loader; independently validates in-scene keyboard navigation.
- **US2 (P1)**: Depends on US1's scene option renderer; adds editable world-position/size configuration.
- **US3 (P1)**: Depends on US1 selection events and US2's per-option configuration shape; adds camera motion and restoration.
- **US4 (P2)**: Depends on US1's scene objects and active menu-level updates; staged reveal can be validated independently after those are present.

### Parallel Opportunities

- T007 and T008 can run in parallel because they edit separate schema/config files and both derive from the documented contract.
- T010 and T013 can run in parallel after the transition-busy interface is agreed because they edit separate camera-transition and keyboard modules.
- Within US1, renderer work in `src/menu/sceneMenu.js` can proceed alongside scene shell work in `index.html` and `src/style.css` after the interface boundary is agreed.
- Avoid parallel edits to `src/main.js`, `src/menu/sceneMenu.js`, or `src/menu/keyboard.js` across different user stories; those files coordinate story integration.

## Parallel Example: User Story 2

```text
Task: T007 Extend the JSON Schema in specs/002-redesign-menu-system/contracts/config-schema.json
Task: T008 Add example presentation values in src/config/config.json
```

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 2 foundational normalization.
2. Complete Phase 3 to place the menu in the Three.js scene and preserve keyboard navigation.
3. Validate the US1 independent scenario before continuing.

### Incremental Delivery

1. Add US2 configurable label presentation and verify config-only changes.
2. Add US3 selection-driven camera destinations, transitions, and saved-view return behavior.
3. Add US4 hidden-on-load and active-submenu blur reveals.
4. Complete teardown and run the quickstart browser/build validation.

## Notes

- Automated-test tasks are omitted because the spec does not explicitly request them; use the independent manual validation criteria above and `quickstart.md`.
- Every task has a sequential ID, a checkbox, a story label where required, and an exact file path.
- `[P]` is reserved for tasks with separate file ownership and no incomplete-task dependency.
