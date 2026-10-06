# Quickstart: Redesign Menu System

## Prerequisites

- Node.js and npm installed.
- Project dependencies installed with `npm install`.
- A modern desktop browser with WebGL enabled.

## Start the App

From the repository root:

```sh
npm run dev
```

Open the local URL printed by Vite. The simulator model and root menu should load; root menu text begins hidden and then blurs into view.

## Validate Menu Configuration

1. Edit an option in `src/config/config.json`.
2. Change root `menuSettings.position` (`x`, `y`, `z`) to move the complete menu; option `presentation.position` values remain local placements within it.
3. Change an option's `label`, `presentation.position` (`x`, `y`, `z`), `presentation.rotation` (`x`, `y`, `z` in degrees), and `presentation.size`.
4. Reload the page and verify the root offset moves all menu labels together, while per-option positions, fixed rotations, and sizes remain effective.
5. Confirm the config conforms to [contracts/config-schema.json](contracts/config-schema.json).

To set a shared text size for one submenu, set that group's `presentation.childSize`. Its children inherit the value unless a child specifies its own `presentation.size`.

## Validate Keyboard Navigation and Reveals

1. Wait for the root reveal to complete.
2. Use Up/Down to change the highlighted 3D option.
3. Press Enter on a group and verify only that submenu blurs into view.
4. Note the camera view before entering the submenu, then use Delete or Backspace, or select the Back option with Enter; verify the parent menu and saved camera view return.
5. Confirm inactive submenu options are hidden and cannot be selected.

## Validate Camera Transitions

1. Add `camera.position` and `camera.focus` coordinates to one option.
2. Set `camera.transition.duration` and choose `linear` or `easeInOut` for `camera.transition.easing`.
3. Select the option and verify the camera travels smoothly to the destination and faces the configured focus point.
4. Select an option without a `camera` object and verify the current camera view is retained.
5. While a configured transition is in progress, press Enter, Delete, and Backspace and verify those actions are ignored until the transition completes; verify arrow keys can still change the highlight.

To tune the initial camera view, edit the root `cameraSettings.home.position` and `cameraSettings.home.focusOffset` values in `src/config/config.json`. The focus offset is added to the calculated model center. To tune the default idle pan, edit `cameraSettings.idlePan`: `axis` selects `x`, `y`, or `z`; `amplitude` is the maximum offset in scene units (use `0` to disable it); and `period` is the number of seconds for one full back-and-forth cycle. An option may override these same three fields inside its `camera` object as `camera.idlePan`; options without an override use the root settings.

## Run Automated Checks

```sh
node --test src/**/*.test.js
npm run build
```

Expected result: all Node tests pass and Vite emits a production build into `dist/`. A large-chunk warning from Three.js may be reported; it is not a build failure.