const MENU_NODE_TYPES = new Set(['group', 'action', 'back']);
const CAMERA_EASINGS = new Set(['linear', 'easeInOut']);
const CAMERA_AXES = new Set(['x', 'y', 'z']);
const DEFAULT_HOME_CAMERA = {
  position: { x: 0, y: 1.4, z: 8 },
  focusOffset: { x: 0, y: 0, z: 0 },
};
const DEFAULT_MENU_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_IDLE_PAN = { axis: 'x', amplitude: 0.08, period: 8 };

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isVector3(value) {
  return value
    && Number.isFinite(value.x)
    && Number.isFinite(value.y)
    && Number.isFinite(value.z);
}

function normalizePresentation(presentation) {
  if (!presentation || typeof presentation !== 'object' || Array.isArray(presentation)) {
    return undefined;
  }

  const normalized = {};
  if (isVector3(presentation.position)) {
    normalized.position = {
      x: presentation.position.x,
      y: presentation.position.y,
      z: presentation.position.z,
    };
  }

  if (isVector3(presentation.rotation)) {
    normalized.rotation = {
      x: presentation.rotation.x,
      y: presentation.rotation.y,
      z: presentation.rotation.z,
    };
  }

  if (Number.isFinite(presentation.size) && presentation.size > 0) {
    normalized.size = presentation.size;
  }

  if (Number.isFinite(presentation.childSize) && presentation.childSize > 0) {
    normalized.childSize = presentation.childSize;
  }

  return Object.keys(normalized).length ? normalized : undefined;
}

function normalizeCamera(camera) {
  if (!camera || typeof camera !== 'object' || Array.isArray(camera)) {
    return undefined;
  }

  if (!isVector3(camera.position) || !isVector3(camera.focus)) {
    return undefined;
  }

  if (camera.position.x === camera.focus.x
    && camera.position.y === camera.focus.y
    && camera.position.z === camera.focus.z) {
    return undefined;
  }

  const normalized = {
    position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
    focus: { x: camera.focus.x, y: camera.focus.y, z: camera.focus.z },
  };

  if (camera.transition !== undefined) {
    const transition = camera.transition;
    if (!transition || typeof transition !== 'object' || Array.isArray(transition)) {
      return undefined;
    }

    if (transition.duration !== undefined
      && (!Number.isFinite(transition.duration) || transition.duration < 0)) {
      return undefined;
    }

    if (transition.easing !== undefined && !CAMERA_EASINGS.has(transition.easing)) {
      return undefined;
    }

    normalized.transition = {};
    if (transition.duration !== undefined) {
      normalized.transition.duration = transition.duration;
    }
    if (transition.easing !== undefined) {
      normalized.transition.easing = transition.easing;
    }
  }

  if (camera.idlePan !== undefined) {
    const idlePan = camera.idlePan;
    if (!idlePan || typeof idlePan !== 'object' || Array.isArray(idlePan)) {
      return undefined;
    }

    normalized.idlePan = {};
    if (idlePan.axis !== undefined && CAMERA_AXES.has(idlePan.axis)) {
      normalized.idlePan.axis = idlePan.axis;
    }
    if (idlePan.amplitude !== undefined
      && Number.isFinite(idlePan.amplitude)
      && idlePan.amplitude >= 0) {
      normalized.idlePan.amplitude = idlePan.amplitude;
    }
    if (idlePan.period !== undefined
      && Number.isFinite(idlePan.period)
      && idlePan.period > 0) {
      normalized.idlePan.period = idlePan.period;
    }
  }

  return normalized;
}

function normalizeCameraSettings(cameraSettings) {
  const home = cameraSettings?.home;
  const idlePan = cameraSettings?.idlePan;
  return {
    home: {
      position: isVector3(home?.position) ? { ...home.position } : { ...DEFAULT_HOME_CAMERA.position },
      focusOffset: isVector3(home?.focusOffset) ? { ...home.focusOffset } : { ...DEFAULT_HOME_CAMERA.focusOffset },
    },
    idlePan: {
      axis: CAMERA_AXES.has(idlePan?.axis) ? idlePan.axis : DEFAULT_IDLE_PAN.axis,
      amplitude: Number.isFinite(idlePan?.amplitude) && idlePan.amplitude >= 0
        ? idlePan.amplitude
        : DEFAULT_IDLE_PAN.amplitude,
      period: Number.isFinite(idlePan?.period) && idlePan.period > 0
        ? idlePan.period
        : DEFAULT_IDLE_PAN.period,
    },
  };
}

function normalizeMenuSettings(menuSettings) {
  return {
    position: isVector3(menuSettings?.position)
      ? { ...menuSettings.position }
      : { ...DEFAULT_MENU_POSITION },
  };
}

function normalizeNode(node, siblingIds, isRoot = false) {
  if (!node || typeof node !== 'object' || Array.isArray(node)) {
    throw new TypeError('Each menu node must be an object.');
  }

  if (!isNonEmptyString(node.id) || !isNonEmptyString(node.label)) {
    throw new TypeError('Each menu node must have a non-empty id and label.');
  }

  if (siblingIds.has(node.id)) {
    throw new TypeError(`Menu node id must be unique among siblings: ${node.id}`);
  }
  siblingIds.add(node.id);

  if (!isRoot && !MENU_NODE_TYPES.has(node.type)) {
    throw new TypeError(`Menu node ${node.id} must have type group, action, or back.`);
  }

  if (node.children !== undefined && !Array.isArray(node.children)) {
    throw new TypeError(`Menu node ${node.id} children must be an array.`);
  }

  const normalized = { ...node, id: node.id.trim(), label: node.label.trim() };
  if (node.children) {
    const childIds = new Set();
    normalized.children = node.children.map((child) => normalizeNode(child, childIds));
  }

  const presentation = normalizePresentation(node.presentation);
  if (presentation) {
    normalized.presentation = presentation;
  } else {
    delete normalized.presentation;
  }

  const camera = normalizeCamera(node.camera);
  if (camera) {
    normalized.camera = camera;
  } else {
    delete normalized.camera;
  }

  return normalized;
}

export function normalizeMenuConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new TypeError('Menu configuration must be an object.');
  }

  if (!isNonEmptyString(config.id)
    || !isNonEmptyString(config.label)
    || !Array.isArray(config.children)) {
    throw new TypeError('Menu configuration requires a non-empty id, label, and children array.');
  }

  const normalized = normalizeNode(config, new Set(), true);
  normalized.menuSettings = normalizeMenuSettings(config.menuSettings);
  normalized.cameraSettings = normalizeCameraSettings(config.cameraSettings);
  return normalized;
}
