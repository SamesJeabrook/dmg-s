import './style.css';
import { loadMenuConfig } from './utils/safeConfigLoader.js';
import { createMenuState } from './menu/menuState.js';
import { bindKeyboardControls } from './menu/keyboard.js';
import { initScene } from './scene/initScene.js';

const statusValue = document.querySelector('.status-value');

function setStatus(message) {
  if (statusValue) {
    statusValue.textContent = message;
  }
}

async function bootstrap() {
  const config = await loadMenuConfig();
  const state = createMenuState(config);
  const sceneController = initScene(
    document.querySelector('#scene-root'),
    state,
    config.cameraSettings,
    config.menuSettings,
  );
  const cameraViewHistory = [];

  const moveToNodeView = (node) => {
    if (node?.camera) {
      sceneController.moveCamera({
        ...node.camera,
        idlePan: node.camera.idlePan ?? config.cameraSettings.idlePan,
      }, node.camera.transition);
    }
  };

  const handleSelection = (result) => {
    if (!result) {
      return;
    }

    if (result.type === 'action') {
      const { node } = result;
      setStatus(`${node.label} selected`);
      moveToNodeView(node);
      return;
    }

    if (result.type === 'open') {
      const { node } = result;
      cameraViewHistory.push(sceneController.getCameraView());
      moveToNodeView(node);
      setStatus(`${node.label} opened`);
      return;
    }

    if (result.type === 'back') {
      const current = state.getCurrentNode();
      const previousView = cameraViewHistory.pop();
      if (previousView) {
        sceneController.moveCamera(previousView);
      }
      setStatus(current?.label ? `${current.label} view` : 'Main menu');
      return;
    }

    if (result.type === 'focus') {
      setStatus(`${result.node.label} highlighted`);
    }
  };

  const render = () => {
    sceneController.renderMenu();
    const current = state.getCurrentNode();
    const summary = current?.label ?? 'Main Menu';
    setStatus(`${summary} menu · ${state.getVisibleItems()[state.state.activeIndex]?.label ?? ''}`);
  };

  bindKeyboardControls(state, render, handleSelection, {
    isBusy: sceneController.isCameraMoving,
    isEnabled: sceneController.isMenuReady,
  });
  render();
}

bootstrap();
