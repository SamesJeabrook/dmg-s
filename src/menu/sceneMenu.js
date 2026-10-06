import * as THREE from 'three';

const DEFAULT_LAYOUT = {
  x: -3.2,
  y: 1.6,
  z: 0.6,
  verticalSpacing: 0.55,
  size: 0.36,
  revealDuration: 0.9,
};

function createLabelTexture(label, isActive, isBackOption, blurred = false) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 96;
  const fontWeight = isActive ? 700 : 500;
  const fontFamily = 'Georgia, serif';
  const font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  context.font = font;
  const textWidth = Math.ceil(context.measureText(label).width);
  canvas.width = Math.max(512, textWidth + 100);
  canvas.height = 160;
  context.font = font;
  context.textBaseline = 'middle';
  context.textAlign = 'left';
  context.shadowColor = isActive ? 'rgba(83, 214, 198, 0.9)' : 'rgba(0, 0, 0, 0.4)';
  context.shadowBlur = isActive ? 20 : 8;
  context.fillStyle = isBackOption ? '#8ef0d9' : (isActive ? '#f5fff8' : '#d3e1dc');
  if (blurred) {
    context.filter = 'blur(10px)';
  }

  context.fillText(label, 42, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

function createLabel(item, index, selectedIndex, options, revealProgress, inheritedSize) {
  const isActive = index === selectedIndex;
  const isBackOption = item.isBackOption || item.type === 'back';
  const group = new THREE.Group();
  const sharpMaterial = new THREE.MeshBasicMaterial({
    map: createLabelTexture(item.label, isActive, isBackOption),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    opacity: revealProgress,
  });
  const blurredMaterial = new THREE.MeshBasicMaterial({
    map: createLabelTexture(item.label, isActive, isBackOption, true),
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    opacity: 1 - revealProgress,
  });
  const sharpPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), sharpMaterial);
  const blurredPlane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blurredMaterial);
  sharpPlane.renderOrder = 10;
  blurredPlane.renderOrder = 9;
  const position = item.presentation?.position ?? {
    x: options.x,
    y: options.y - index * options.verticalSpacing,
    z: options.z,
  };

  const rotation = item.presentation?.rotation ?? { x: 0, y: 0, z: 0 };
  const widthScale = Math.max(item.label.length * 0.62, 2);
  const applyLabelTransform = (plane) => {
    plane.geometry.translate(0.5, 0, 0);
    plane.position.set(position.x, position.y, position.z);
    plane.rotation.set(
      THREE.MathUtils.degToRad(rotation.x),
      THREE.MathUtils.degToRad(rotation.y),
      THREE.MathUtils.degToRad(rotation.z),
    );
  };

  applyLabelTransform(sharpPlane);
  applyLabelTransform(blurredPlane);
  const size = item.presentation?.size ?? inheritedSize ?? options.size;
  sharpPlane.scale.set(size * widthScale, size, 1);
  blurredPlane.scale.copy(sharpPlane.scale);
  group.add(blurredPlane, sharpPlane);

  let marker = null;
  if (isActive) {
    marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.045, 12, 12),
      new THREE.MeshBasicMaterial({
        color: 0x53d6c6,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        opacity: revealProgress,
      }),
    );
    marker.renderOrder = 11;
    marker.position.set(position.x - 0.12, position.y, position.z + 0.02);
    group.add(marker);
  }

  return { group, sharpPlane, blurredPlane, marker };
}

export function createSceneMenu(parent, layout = {}, position = { x: 0, y: 0, z: 0 }) {
  const options = { ...DEFAULT_LAYOUT, ...layout };
  const root = new THREE.Group();
  root.position.set(position.x, position.y, position.z);
  parent.add(root);
  let activeLabels = [];
  let activeLevelId = null;
  let revealStartedAt = null;
  let revealProgress = 0;
  let revealStatus = 'hidden';

  function render(state) {
    const activeNode = state.getCurrentNode();
    const levelId = activeNode?.id ?? 'root';
    if (levelId !== activeLevelId) {
      activeLevelId = levelId;
      revealStartedAt = null;
      revealProgress = 0;
      revealStatus = 'hidden';
    }

    clearLabels();
    const items = state.getVisibleItems();
    const childSize = activeNode?.presentation?.childSize;
    activeLabels = items.map((item, index) => {
      const label = createLabel(item, index, state.state.activeIndex, options, revealProgress, childSize);
      label.group.visible = revealStatus !== 'hidden';
      root.add(label.group);
      return label;
    });
  }

  function clearLabels() {
    for (const label of activeLabels) {
      root.remove(label.group);
      label.group.traverse((object) => {
        if (object.isMesh && object.material.map) {
          object.material.map?.dispose();
          object.material.dispose();
          object.geometry.dispose();
        } else if (object.isMesh) {
          object.geometry.dispose();
          object.material.dispose();
        }
      });
    }
    activeLabels = [];
  }

  function update(nowSeconds) {
    if (revealStartedAt === null) {
      revealStartedAt = nowSeconds;
      revealStatus = 'revealing';
    }

    revealProgress = Math.min((nowSeconds - revealStartedAt) / options.revealDuration, 1);
    revealStatus = revealProgress >= 1 ? 'visible' : 'revealing';

    for (const label of activeLabels) {
      label.group.visible = true;
      label.sharpPlane.material.opacity = revealProgress;
      label.blurredPlane.material.opacity = 1 - revealProgress;
      if (label.marker) {
        label.marker.material.opacity = revealProgress;
      }
    }
  }

  function isReady() {
    return revealStatus === 'visible';
  }

  return {
    render,
    update,
    isReady,
    clear: clearLabels,
    dispose() {
      clearLabels();
      parent.remove(root);
    },
  };
}
