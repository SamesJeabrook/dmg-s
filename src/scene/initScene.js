import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSceneMenu } from '../menu/sceneMenu.js';
import { createCameraTransition } from './cameraTransition.js';

const CAMERA_TARGET_SETTINGS = {
  target: null,
  targetOffset: { x: 0, y: 0, z: 0 },
};

export function initScene(container, menuState, cameraMotion) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x020b13, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  camera.position.set(0, 1.4, 8);
  const cameraTransition = createCameraTransition(camera, undefined, cameraMotion?.idlePan);

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xbfe9ff, 2.2);
  keyLight.position.set(6, 8, 5);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x9ad8ff, 1.5);
  rimLight.position.set(-5, 3, -4);
  scene.add(rimLight);

  const loader = new GLTFLoader();
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);
  const sceneMenu = createSceneMenu(modelGroup);
  loader.load(
    '/assets/Meshy_AI_Racing_Simulator_Pano_0928174010_texture.glb',
    (gltf) => {
      const model = gltf.scene;
      model.scale.setScalar(1.2);
      model.rotation.y = Math.PI * 0.15;
      model.position.y = -0.8;
      modelGroup.add(model);
      modelGroup.updateMatrixWorld(true);

      const modelBounds = new THREE.Box3().setFromObject(model);
      const modelCenter = modelBounds.getCenter(new THREE.Vector3());
      const target = CAMERA_TARGET_SETTINGS.target ?? {
        x: modelCenter.x + CAMERA_TARGET_SETTINGS.targetOffset.x,
        y: modelCenter.y + CAMERA_TARGET_SETTINGS.targetOffset.y,
        z: modelCenter.z + CAMERA_TARGET_SETTINGS.targetOffset.z,
      };
      cameraTransition.setFocus(target);
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
