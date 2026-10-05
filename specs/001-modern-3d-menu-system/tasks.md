# Tasks: Modern 3D Menu System

**Input**: Design documents from `/specs/001-modern-3d-menu-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the static Vite project and establish the project structure needed for the single-page Three.js UI.

- [x] T001 Create the project structure for the static Vite app with `index.html`, `src/`, `assets/`, and `src/config/` per the implementation plan
- [x] T002 Initialize the Vite project and dependency manifest in `package.json` for a vanilla ES6 + Three.js setup
- [x] T003 [P] Create the root page shell in `index.html` with a single app mount point for the cinematic menu and 3D scene
- [x] T004 [P] Create the default menu configuration file in `src/config/config.json` with the initial root node and nested option structure

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the app shell, config loading, and shared rendering foundation needed before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create the application bootstrap in `src/main.js` to load config, initialize the scene, and mount the UI
- [x] T006 [P] Implement defensive config loading in `src/utils/safeConfigLoader.js` to handle missing or malformed JSON without crashing the page
- [x] T007 [P] Create the ultra-wide base styling in `src/style.css` for the three-monitor-style layout and menu positioning
- [x] T008 Define the menu data contract and configuration shape in `src/config/config.json` to support nested `children` entries and a selectable Back option
- [x] T009 Implement the shared menu state model in `src/menu/menuState.js` for active path, highlight index, and node traversal

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

---

## Phase 3: User Story 1 - Keyboard navigation and hierarchical menu behavior (Priority: P1) 🎯 MVP

**Goal**: Deliver a keyboard-driven menu system with nested options, Enter-to-select, and Back navigation that works independently from the 3D scene.

**Independent Test**: A user can load the app, traverse options with the keyboard, open a submenu, and return to the parent menu using Delete or the Back option.

### Implementation for User Story 1

- [x] T010 [P] [US1] Implement arrow-key traversal and focus handling in `src/menu/keyboard.js` for the root and nested menu states
- [x] T011 [P] [US1] Implement menu rendering in `src/menu/renderMenu.js` so each `MenuNode` is displayed with the active highlight and nested branch structure
- [x] T012 [US1] Add Enter-to-select behavior and Back-to-parent behavior in `src/menu/menuState.js` so selection can open submenus or return to previous hierarchy
- [x] T013 [US1] Wire the menu state to the DOM in `src/main.js` so the rendered list reflects the active node tree and selected item
- [x] T014 [US1] Ensure the config-driven menu includes a `back`-style option as a selectable node for nested submenus in `src/config/config.json`
- [x] T015 [US1] Add graceful fallback behavior for root-level Delete actions and invalid menu paths in `src/utils/safeConfigLoader.js`

**Checkpoint**: At this point, User Story 1 should be fully functional and independently testable.

---

## Phase 4: User Story 2 - Configurable submenus and option hierarchy (Priority: P1)

**Goal**: Validate that the menu can be configured externally and supports nested options without hard-coded UI changes.

**Independent Test**: A developer edits `src/config/config.json` and reloads the page to confirm the menu structure updates without code changes.

### Implementation for User Story 2

- [x] T016 [P] [US2] Extend the config schema contract in `src/config/config.json` to cover nested `children` arrays, option labels, and action metadata
- [x] T017 [P] [US2] Update `src/menu/renderMenu.js` to render nested menu trees recursively from the config structure
- [x] T018 [US2] Update `src/menu/menuState.js` to maintain a path stack for parent navigation and active submenu selection
- [x] T019 [US2] Validate that a missing or empty submenu renders a sensible no-data state without breaking keyboard interaction in `src/main.js`

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: User Story 3 - Slow camera orbit and immersive 3D presentation (Priority: P2)

**Goal**: Add the 3D scene and cinematic presentation layer around the configurable menu while keeping the project static and browser-native.

**Independent Test**: The page loads with a Three.js model and the camera slowly orbits the asset while the menu remains interactive.

### Implementation for User Story 3

- [x] T020 [P] [US3] Initialize the Three.js scene in `src/scene/initScene.js` with renderer, camera, lighting, and the Mesy_AI_Racing_Simulator asset loader
- [x] T021 [P] [US3] Implement a slow orbit animation in `src/scene/cameraOrbit.js` so the camera pans around the model without abrupt motion
- [x] T022 [US3] Hook the scene lifecycle into the app bootstrap in `src/main.js` so the model and menu start together on page load
- [x] T023 [US3] Fit the wide-format stage to an ultra-wide desktop canvas in `src/style.css` so the UI behaves like a stretched triple-monitor layout
- [x] T024 [US3] Confirm the rendered scene does not rely on a server runtime or framework-specific asset pipeline and remains compatible with static deployment

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final quality passes for the menu system and cinematic scene.

- [x] T025 [P] Review the config structure against the user requirement for “basic menu options configurable in a separate config.json file” and adjust the default file in `src/config/config.json`
- [x] T026 [P] Verify that all menu branches can be traversed with keyboard input and that the Back option remains selectable in nested views
- [x] T027 [P] Validate that the page remains usable and visually stable in the ultra-wide layout without requiring a framework or external service
- [x] T028 Run a browser-level smoke check for the static Vite build and confirm the app loads the model and menu without runtime errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story phases (Phase 3-5)**: All depend on the Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired story work being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on other stories
- **User Story 2 (P1)**: Can start after Foundational; should stay independent from Story 1 logic
- **User Story 3 (P2)**: Can start after Foundational; independent from the menu logic as long as the scene is mounted after app bootstrap

### Within Each User Story

- Shared data and state setup before rendering
- Rendering before event handling integration
- Event handling before final UX validation

### Parallel Opportunities

- Setup tasks T003 and T004 can run in parallel
- Foundational tasks T006, T007, and T009 can run in parallel
- User Story 1 tasks T010 and T011 can run in parallel
- User Story 2 tasks T016 and T017 can run in parallel
- User Story 3 tasks T020 and T021 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch parallel tasks for the menu navigation story:
Task: "Implement arrow-key traversal and focus handling in src/menu/keyboard.js"
Task: "Implement menu rendering in src/menu/renderMenu.js"
Task: "Update the default config in src/config/config.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Stop and validate keyboard navigation, submenu depth, and Back behavior
5. Only then continue to the 3D scene and integration polish

### Incremental Delivery

1. Setup + Foundational → app shell ready
2. Add User Story 1 → menu behavior validated independently
3. Add User Story 2 → config-driven nested menu validated independently
4. Add User Story 3 → cinematic 3D scene validated independently
5. Finish with narrative polish and smoke validation

### Parallel Team Strategy

With multiple developers:

1. One developer handles the app shell and config contract
2. One developer handles menu state and keyboard input
3. One developer handles 3D scene and visual styling
4. Merge after each independent story checkpoint

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Avoid vague tasks and cross-story dependency chains that break independence
- This feature intentionally does not include automated tests or a documentation suite, so verification is manual and browser-based
