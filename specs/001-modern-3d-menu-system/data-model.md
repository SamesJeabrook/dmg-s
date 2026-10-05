# Data Model: Modern 3D Menu System

## Core Entities

### MenuConfig
Represents the root configuration object loaded from `config.json`.

- `id`: string
- `label`: string
- `children`: MenuNode[]
- `defaultSelected`: string | null

### MenuNode
Represents one menu item or branch in the configuration tree.

- `id`: string
- `label`: string
- `type`: "group" | "action" | "back"
- `children`: MenuNode[]
- `target`: string | null
- `description`: string | null
- `isBackOption`: boolean

### MenuSelectionState
Tracks the active path and highlight state during keyboard navigation.

- `path`: string[]
- `activeIndex`: number
- `currentNodeId`: string
- `parentPath`: string[]

### SceneModel
Represents the rendered 3D visual asset and camera animation state.

- `assetPath`: string
- `model`: Object3D | null
- `cameraOrbitSpeed`: number
- `focusPoint`: Vector3

## Relationships

- `MenuConfig` owns a tree of `MenuNode` instances.
- `MenuSelectionState` resolves against the active `MenuNode` chain.
- `MenuNode` may contain nested child nodes to represent submenu branches.
- `SceneModel` is independent from the menu tree but shares the same page lifecycle.

## Validation Rules

- Each menu node MUST have a unique `id` within its parent branch.
- A `back` option MUST exist within nested menu groups when navigation depth is greater than 0.
- The config MUST be JSON-serializable and parseable on app startup.
- Each menu node that has children MUST support navigation into its submenu.
- The app MUST guard against missing or malformed config input and present a safe fallback state.
