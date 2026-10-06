import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSceneMenu } from '../menu/sceneMenu.js';
import { createCameraTransition } from './cameraTransition.js';

const CAMERA_TARGET_SETTINGS = {
  target: null,
  targetOffset: { x: 0, y: 0, z: 0 },
};

export function initScene(container, menuState, cameraSettings, menuSettings) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020b13, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  const homeCamera = cameraSettings?.home;
  const homePosition = homeCamera?.position ?? { x: 0, y: 1.4, z: 8 };
  const homeFocusOffset = homeCamera?.focusOffset ?? { x: 0, y: 0, z: 0 };
  camera.position.set(homePosition.x, homePosition.y, homePosition.z);
  const cameraTransition = createCameraTransition(camera, homeFocusOffset, cameraSettings?.idlePan);

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xbfe9ff, 1.25);
  keyLight.position.set(6, 8, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9ad8ff, 0.35);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const environment = new THREE.Group();
  scene.add(environment);
  const sceneMenu = createSceneMenu(scene, undefined, menuSettings?.position);
  const gltfLoader = new GLTFLoader();
  let garageModel = null;
  let simulatorModel = null;

  const placeLoadedModels = () => {
    if (!garageModel || !simulatorModel) {
      return;
    }

    garageModel.updateMatrixWorld(true);
    const garageSourceBounds = new THREE.Box3().setFromObject(garageModel);
    const garageSourceSize = garageSourceBounds.getSize(new THREE.Vector3());
    const garageSourceCenter = garageSourceBounds.getCenter(new THREE.Vector3());
    const garageScale = 18 / Math.max(garageSourceSize.x, garageSourceSize.z, 0.001);

    garageModel.scale.setScalar(garageScale);
    garageModel.position.set(
      -garageSourceCenter.x * garageScale,
      -garageSourceBounds.min.y * garageScale,
      -garageSourceCenter.z * garageScale,
    );
    environment.add(garageModel);
    environment.updateMatrixWorld(true);

    const garageBounds = new THREE.Box3().setFromObject(garageModel);
    simulatorModel.rotation.y = Math.PI * 0.15;
    simulatorModel.updateMatrixWorld(true);

    const simulatorSourceBounds = new THREE.Box3().setFromObject(simulatorModel);
    const simulatorSourceSize = simulatorSourceBounds.getSize(new THREE.Vector3());
    const simulatorSourceWidth = Math.max(simulatorSourceSize.x, simulatorSourceSize.z, 0.001);
    const targetSimulatorWidth = garageBounds.getSize(new THREE.Vector3()).x * 0.2;
    simulatorModel.scale.setScalar(targetSimulatorWidth / simulatorSourceWidth);
    simulatorModel.updateMatrixWorld(true);

    const simulatorBounds = new THREE.Box3().setFromObject(simulatorModel);
    const simulatorCenter = simulatorBounds.getCenter(new THREE.Vector3());
    const garageCenter = garageBounds.getCenter(new THREE.Vector3());
    simulatorModel.position.x += garageCenter.x - simulatorCenter.x;
    simulatorModel.position.z += garageCenter.z - simulatorCenter.z;
    simulatorModel.position.y -= simulatorBounds.min.y - garageBounds.min.y - .5
    environment.add(simulatorModel);
    environment.updateMatrixWorld(true);

    const finalSimulatorBounds = new THREE.Box3().setFromObject(simulatorModel);
    const simulatorFocus = finalSimulatorBounds.getCenter(new THREE.Vector3());
    const target = CAMERA_TARGET_SETTINGS.target ?? {
      x: simulatorFocus.x + homeFocusOffset.x + CAMERA_TARGET_SETTINGS.targetOffset.x,
      y: simulatorFocus.y + homeFocusOffset.y + CAMERA_TARGET_SETTINGS.targetOffset.y,
      z: simulatorFocus.z + homeFocusOffset.z + CAMERA_TARGET_SETTINGS.targetOffset.z,
    };
    cameraTransition.setFocus(target);
  };

  gltfLoader.load(
    '/assets/Underground+Garage+Scene.glb',
    (gltf) => {
      garageModel = gltf.scene;
      placeLoadedModels();
    },
    undefined,
    (error) => {
      console.error('Failed to load the garage environment GLB:', error);
    },
  );

  gltfLoader.load(
    '/assets/Meshy_AI_Racing_Simulator_Pano_0928174010_texture.glb',
    (gltf) => {
      simulatorModel = gltf.scene;
      placeLoadedModels();
    },
    undefined,
    (error) => {
      console.error('Failed to load the simulator model:', error);
    },
  );

  container.appendChild(renderer.domElement);

  const resize = () => {
    const width = container.clientWidth || 1;
    const height = container.clientHeight || 1;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  resize();
  sceneMenu.render(menuState);

  let animationFrameId;
  const tick = (time) => {
    const seconds = time * 0.001;
    cameraTransition.update(seconds);
    sceneMenu.update(seconds);
    renderer.render(scene, camera);
    animationFrameId = requestAnimationFrame(tick);
  };

  animationFrameId = requestAnimationFrame(tick);
  window.addEventListener('resize', resize);

  return {
    renderer,
    scene,
    camera,
    getCameraView() {
      return cameraTransition.getView();
    },
    moveCamera(view, transition = {}) {
      return cameraTransition.start(view, performance.now() * 0.001, transition);
    },
    isCameraMoving() {
      return cameraTransition.isBusy();
    },
    renderMenu() {
      sceneMenu.render(menuState);
    },
    isMenuReady() {
      return sceneMenu.isReady();
    },
    cleanup() {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      sceneMenu.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    },
  };
}
