# Data Model: Redesign Menu System

## Menu Configuration

The configuration is a static tree rooted at one menu object. Root and child menu objects keep the existing `id`, `label`, and `children` hierarchy. Child nodes also retain `type` and existing action/back metadata.

The root `menuSettings.position` is an XYZ translation applied to the whole menu group. Each node's `presentation.position` remains local to that translated group.

### MenuNode

| Field | Type | Required | Validation / meaning |
|-------|------|----------|---------------------|
| `id` | string | Yes | Non-empty and unique among siblings; used to identify the node in the active path. |
| `label` | string | Yes | Non-empty user-visible text. |
| `type` | `group`, `action`, or `back` | Yes for child nodes | `group` opens children; `action` performs the current configured action; `back` returns to the parent. |
| `children` | array of MenuNode | No | Child options; groups with no children behave as non-navigable leaves or are rejected during config validation. |
| `presentation` | MenuPresentation | No | World-space label position, fixed XYZ rotation in degrees, and visual size; omitted values receive a documented default or sibling layout. |
| `camera` | CameraViewpoint | No | Optional camera destination and transition settings for selecting the node. |
| `target` | string or null | No | Existing action identifier, retained for compatibility. |
| `description` | string or null | No | Existing optional action description, available to status/accessibility presentation. |
| `isBackOption` | boolean | No | Existing compatibility flag; `type: "back"` is the canonical representation. |

### MenuPresentation

| Field | Type | Required | Validation / meaning |
|-------|------|----------|---------------------|
| `position` | `{x, y, z}` finite numbers | No | World-space location of the label relative to the scene. |
| `rotation` | `{x, y, z}` finite numbers | No | Fixed Euler rotation in degrees; defaults to `{x: 0, y: 0, z: 0}` and does not billboard toward the camera. |
| `size` | positive number | No | World-space visual scale; values must be greater than zero. |
| `childSize` | positive number | No | Default size for the current menu group's child options; a child's own `presentation.size` overrides it. |

Position, rotation, and size are independent of camera coordinates. A missing presentation field uses menu defaults so every existing node can still render.

### CameraViewpoint

| Field | Type | Required when `camera` is set | Validation / meaning |
|-------|------|--------------------------------|---------------------|
| `position` | `{x, y, z}` finite numbers | Yes | Destination camera location in scene/world coordinates. |
| `focus` | `{x, y, z}` finite numbers | Yes | Point the camera faces after and during movement. |
| `idlePan` | IdlePan | No | Per-view pan override; omitted values inherit the currently configured pan. |
| `transition` | CameraTransition | No | Motion behavior; omitted values use the default transition. |

### CameraTransition

| Field | Type | Required | Validation / meaning |
|-------|------|----------|---------------------|
| `duration` | non-negative number | No | Transition time in seconds. Zero means apply the destination immediately. |
| `easing` | `linear` or `easeInOut` | No | Allowlisted interpolation curve; default is `easeInOut`. |

Reject or ignore a camera view whose focus equals its destination position because it cannot define a valid viewing direction. Invalid optional camera data should leave the menu usable and retain the current camera view.

## Menu Navigation State

| Field | Type | Meaning |
|-------|------|---------|
| `path` | array of node IDs | Active ancestor chain; identifies the active menu level. |
| `activeIndex` | non-negative integer | Selected index within the active level's ordered child list. |
| `activeNode` | MenuNode | Derived node at `path`; not separately persisted. |
| `cameraViewHistory` | stack of camera viewpoints | Saves the current camera position and focus when a submenu is entered, so either back control can restore it. |

### State Transitions

- Arrow up/down changes `activeIndex`, wrapping within the active node's children.
- Enter on a group with children appends its ID to `path`, resets the index, and activates that submenu.
- Enter on a group with children saves the current camera position and focus to `cameraViewHistory` before the submenu camera transition.
- Enter on a Back node or Delete/Backspace removes the last path entry, resets the index, and restores the saved camera viewpoint for the parent level.
- Enter on an action returns an action selection while preserving the active menu level.
- Input for a menu level is enabled once that level's reveal reaches its visible state.

## Menu Reveal State

| Field | Type | Meaning |
|-------|------|---------|
| `levelId` | node ID | Menu level being revealed. |
| `status` | `hidden`, `revealing`, or `visible` | Controls scene visibility and keyboard eligibility. |
| `progress` | number in `[0, 1]` | Normalized reveal progress. |
| `startedAt` | finite timestamp | Start time used to advance the reveal. |

Root reveal begins after configuration and scene readiness. Submenu reveal begins when its parent is entered. Only active-level options may be visible and selectable.

## Selection and Camera Transition

| Field | Type | Meaning |
|-------|------|---------|
| `selectedNodeId` | node ID | Option that requested the transition. |
| `fromPosition` / `toPosition` | 3D vectors | Camera interpolation endpoints. |
| `fromFocus` / `toFocus` | 3D vectors | Look-at interpolation endpoints. |
| `startedAt` | finite timestamp | Transition start. |
| `duration` | non-negative number | Duration taken from config or the default. |
| `easing` | allowed easing name | Function used to normalize transition progress. |

The transition can start only from an Enter selection. While it is active, Enter, Delete, and Backspace inputs are ignored; arrow-key highlighting may continue. A selection without a valid camera view does not change the current camera state. Entering a submenu snapshots the current camera viewpoint, and leaving that submenu restores the snapshot regardless of whether the user used a key or its Back option.

## Root Camera Settings

The root configuration defines `cameraSettings.home` for the initial camera pose and `cameraSettings.idlePan` for gentle motion around that pose and every completed transition destination. Home focus is calculated from the model center plus the configured focus offset.

| Field | Type | Default | Validation / meaning |
|-------|------|---------|---------------------|
| `home.position` | `{x, y, z}` finite numbers | `{x: 0, y: 1.4, z: 8}` | Initial camera position before a menu selection. |
| `home.focusOffset` | `{x, y, z}` finite numbers | `{x: 0, y: 0, z: 0}` | Offset added to the calculated model center for the initial camera focus. |

| Field | Type | Default | Validation / meaning |
|-------|------|---------|---------------------|
| `axis` | `x`, `y`, or `z` | `x` | Camera position axis along which the drift is applied. |
| `amplitude` | non-negative number | `0.08` | Maximum distance in scene units from the settled viewpoint. Set to `0` to disable idle movement. |
| `period` | positive number | `8` | Time in seconds for one complete back-and-forth cycle. |

An option-level `camera.idlePan` can override any subset of `axis`, `amplitude`, and `period`. Missing values inherit the active/root settings. The active idle-pan settings are part of a saved camera viewpoint and are restored when returning to a parent menu.

The cycle restarts at zero offset after each transition. Camera focus remains unchanged during the drift. Saved submenu views store the settled base viewpoint, not the current oscillation offset.

## Relationships

- A `MenuConfig` owns one root `MenuNode` and its recursive children.
- `MenuNavigationState` selects one active `MenuNode` and one `MenuLevel`.
- An active `MenuLevel` owns a reveal state and its scene text representations.
- A selected `MenuNode` may request one `CameraViewpoint` transition.
- A `MenuPresentation` controls label placement and scale but does not alter hierarchy or keyboard ordering.