# Feature Specification: Redesign Menu System

**Feature Branch**: `002-redesign-menu-system`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: "Redesign menu system. The menu system needs to move to be part of the scene itself, so it has a more interactive feel. The text will appear as 3d static options alongside the main model. The text will be configurable, both in its words and its positioning and size. Keyboard controls remain the same. Upon selecting an option the camera will move to a new point along its x y z cooards and the focus point will also be configurable. Animations to the camera's new position will be configurable. Options will be hidden on load but will blur in, sub options will only blur in when their sub menu has been activated."

## Clarifications

### Session 2026-10-01

- Q: Should the camera move when an option is highlighted with the arrow keys, or only after you press Enter to select it? → A: Only after Enter selects the option.
- Q: If you press Enter on another option while the camera is still moving, should it retarget immediately, finish its current move first, or ignore the new selection until it stops? → A: Ignore Enter until the current camera transition finishes.
- Q: When you return from a submenu using Delete, Backspace, or its Back option, should the camera return to the viewpoint it had before entering, or stay where it is? → A: Return to the viewpoint from before entering the submenu.
- Q: If you press Delete or Backspace while the camera is moving, should back-navigation wait until the movement finishes, or return to the parent menu and restore its saved camera view immediately? → A: Ignore Delete and Backspace until the current camera transition finishes.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the in-scene menu (Priority: P1)

A user navigates and selects menu options presented alongside the main 3D model, using the established keyboard controls. The menu is part of the scene presentation rather than a separate page overlay.

**Why this priority**: In-scene presentation and familiar keyboard navigation are the core of the redesign.

**Independent Test**: Load the scene, wait for the root options to appear, navigate between them with the keyboard, enter a submenu, and return to its parent.

**Acceptance Scenarios**:

1. **Given** the scene has loaded and the root menu reveal has completed, **When** the user presses the up or down arrow key, **Then** the selected menu option changes and is visibly identifiable.
2. **Given** the menu is visible, **When** the user moves the highlight between options, **Then** the camera remains at its current viewpoint.
3. **Given** a menu option has child options, **When** the user presses Enter on it, **Then** its submenu appears in the scene and any configured camera transition begins.
4. **Given** a submenu is active, **When** the user presses Delete or Backspace, **Then** the parent menu becomes active and the camera returns to the viewpoint held before entering the submenu.
5. **Given** a submenu contains a selectable Back option, **When** the user highlights it and presses Enter, **Then** the parent menu becomes active and the camera returns to the viewpoint held before entering the submenu.
6. **Given** a camera transition is in progress, **When** the user presses Enter on another highlighted option, **Then** the new selection is ignored until the current transition finishes.
7. **Given** a camera transition is in progress, **When** the user presses Delete or Backspace, **Then** the back-navigation input is ignored until the current transition finishes.

---

### User Story 2 - Configure in-scene menu presentation (Priority: P1)

A developer can change each menu option's displayed words, location, fixed scene rotation, and visual size without changing how keyboard navigation works.

**Why this priority**: The menu must be adaptable to the scene composition and content without rewriting its interaction model.

**Independent Test**: Change a menu option's label, XYZ position, XYZ rotation, and size in the menu configuration, reload the scene, and verify the option reflects those changes without turning to face the camera.

**Acceptance Scenarios**:

1. **Given** a menu option has configured text, XYZ position, XYZ rotation, and size, **When** the scene is displayed, **Then** that option appears with the configured presentation and fixed orientation.
2. **Given** menu presentation values are changed, **When** the scene is reloaded, **Then** the updated values appear while arrow, Enter, and back navigation remain available.

---

### User Story 3 - Move and aim the camera per selection (Priority: P1)

A user selects an option and sees the camera travel to that option's configured viewpoint, aimed at its configured focus point. Each option can use its own camera transition settings.

**Why this priority**: Configurable camera movement connects menu selection to the 3D scene and delivers the intended interactive feel.

**Independent Test**: Configure an option with a distinct camera position, focus point, and transition, select it, and verify the camera reaches and faces the configured viewpoint.

**Acceptance Scenarios**:

1. **Given** an option has configured camera position and focus coordinates, **When** the user presses Enter to select it, **Then** the camera moves to that position while facing the focus point.
2. **Given** the selected option has configured transition settings, **When** the camera moves, **Then** its transition follows those settings rather than an unrelated default.
3. **Given** an option has no camera settings, **When** the user selects it, **Then** the current camera viewpoint is retained.

---

### User Story 4 - Reveal root and nested options (Priority: P2)

A user first sees the scene without visible menu options; the root options then emerge with a blur-in reveal. Child options remain hidden until their submenu is activated, at which point only that submenu is revealed.

**Why this priority**: Staged reveals support the requested cinematic presentation while keeping inactive submenu choices out of view.

**Independent Test**: Load the scene and observe the root reveal, then activate a submenu and verify its options reveal only after activation.

**Acceptance Scenarios**:

1. **Given** the scene has just loaded, **When** the initial reveal begins, **Then** root options transition from hidden to visible with a blur-in effect.
2. **Given** a submenu has not been activated, **When** the root menu is visible, **Then** that submenu's options remain hidden.
3. **Given** a submenu is activated, **When** its reveal begins, **Then** its options blur in and become available for keyboard navigation.
4. **Given** the user returns to the parent menu, **When** the submenu is no longer active, **Then** its options are not presented as active choices.

### Edge Cases

- A menu option has an empty or unusually long label.
- A configured menu option is placed outside the visible scene area or overlaps another option.
- A submenu is empty or contains only its Back option.
- The user presses navigation keys while a reveal or camera transition is in progress.
- A camera focus point is the same as its camera position, or the configured transition duration is zero.
- The scene or model fails to load while menu content is still available.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST present menu options within the 3D scene alongside the primary model, not as a separate screen overlay.
- **FR-002**: The system MUST display each menu option as static 3D text while its menu level is active.
- **FR-003**: The system MUST allow each menu option's displayed words, scene position, visual size, and fixed XYZ rotation to be configured independently.
- **FR-004**: The system MUST preserve the existing keyboard navigation behavior: up/down arrows move the highlight, Enter selects, and Delete or Backspace returns to the parent menu.
- **FR-005**: The system MUST provide a selectable Back option in submenus and allow Enter on it to return to the parent menu.
- **FR-006**: The system MUST allow a menu option to define a camera destination using three-dimensional position coordinates and a separate three-dimensional focus point.
- **FR-007**: When the user presses Enter to select an option that defines a camera destination, the system MUST move the camera to that destination while aiming at its configured focus point; changing the highlighted option alone MUST NOT move the camera.
- **FR-008**: The system MUST allow camera transition behavior, including its duration and motion character, to be configured for an option.
- **FR-014**: While a camera transition is in progress, the system MUST ignore Enter, Delete, and Backspace inputs until that transition finishes; arrow-key highlighting MAY continue to update the highlighted option.
- **FR-015**: When the user returns from a submenu using Delete, Backspace, or its selectable Back option, the system MUST restore the camera viewpoint held immediately before that submenu was entered.
- **FR-016**: The system MUST support a subtle configurable back-and-forth camera pan while at the home viewpoint and after each camera transition settles.
- **FR-017**: The root configuration MUST allow the home camera position and focus offset from the model center to be set independently of per-option camera destinations.
- **FR-018**: The root configuration MUST allow the complete in-scene menu group to be translated in XYZ while preserving each option's local position.
- **FR-019**: Each menu option with a camera destination MUST be able to override the idle-pan axis, amplitude, and period; when omitted, the root idle-pan settings MUST apply.
- **FR-009**: When a selected option has no camera destination configured, the system MUST retain the current camera viewpoint.
- **FR-010**: The system MUST initially keep root menu options hidden and reveal them with a blur-in transition after the scene loads.
- **FR-011**: The system MUST keep submenu options hidden until their corresponding submenu is activated, then reveal them with a blur-in transition.
- **FR-012**: The system MUST ensure only the active menu level's options are presented as available keyboard choices.
- **FR-013**: The system MUST remain operable when menu labels or positions are changed, without requiring changes to keyboard interaction rules.

### Key Entities *(include if feature involves data)*

- **Menu Option**: A selectable scene item with configurable displayed words, position, size, optional child options, and optional camera destination and transition settings.
- **Menu Level**: A root menu or submenu whose options become available when that level is active.
- **Camera Viewpoint**: A camera position, focus point, and transition description associated with a menu selection.
- **Camera Motion**: A small idle pan axis, amplitude, and cycle period applied around the current settled viewpoint, with optional per-option settings.
- **Home Camera Settings**: The root-level initial camera position and focus offset used before a menu option is selected.
- **Reveal State**: The visibility and reveal progress of root menu options or the currently activated submenu.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from the root menu into a submenu and back using only the established keyboard controls in 100% of the defined acceptance scenarios.
- **SC-002**: A developer can change an option's words, XYZ position, XYZ rotation, and size, then observe all changes after reload without modifying interaction behavior.
- **SC-003**: For every configured menu destination, selecting its option brings the camera to the specified position and aims it at the specified focus point.
- **SC-004**: On each load, root options are hidden before their reveal; submenu options remain hidden until that submenu is activated.
- **SC-005**: Users can identify the active menu choice throughout a reveal and camera transition and can continue or complete keyboard navigation without pointer input.

## Assumptions

- The root menu reveal starts automatically after the scene becomes ready; no separate user action is needed to reveal it.
- A menu option may omit camera settings; in that case, selecting it leaves the camera where it is.
- Per-option transition settings include at least a duration and a selectable motion character; exact supported motion choices are determined during planning.
- Menu configuration remains the source for option text and presentation; this feature does not add a visual menu editor.
- The existing desktop-oriented keyboard controls and static browser deployment constraints remain in effect.
- A blur-in reveal also transitions options to a clearly readable state before they become the active keyboard choices.