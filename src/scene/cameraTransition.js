const DEFAULT_TRANSITION = {
  duration: 1.2,
  easing: 'easeInOut',
};

const DEFAULT_IDLE_PAN = {
  axis: 'x',
  amplitude: 0.08,
  period: 8,
};

function lerpVector(from, to, progress) {
  return {
    x: from.x + (to.x - from.x) * progress,
    y: from.y + (to.y - from.y) * progress,
    z: from.z + (to.z - from.z) * progress,
  };
}

function copyVector(vector) {
  return { x: vector.x, y: vector.y, z: vector.z };
}

function easeProgress(progress, easing) {
  if (easing === 'linear') {
    return progress;
  }

  return progress * progress * (3 - 2 * progress);
}

export function createCameraTransition(
  camera,
  initialFocus = { x: 0, y: 0, z: 0 },
  idlePan = {},
) {
  let pan = { ...DEFAULT_IDLE_PAN, ...idlePan };
  let focus = copyVector(initialFocus);
  let basePosition = copyVector(camera.position);
  let transition = null;
  let idleStartedAt = null;

  function applyCameraPose(position, nextFocus) {
    camera.position.set(position.x, position.y, position.z);
    focus = copyVector(nextFocus);
    camera.lookAt(focus.x, focus.y, focus.z);
  }

  function setFocus(nextFocus) {
    focus = copyVector(nextFocus);
    camera.lookAt(focus.x, focus.y, focus.z);
    idleStartedAt = null;
  }

  function start(view, nowSeconds, transitionSettings = {}) {
    if (!view?.position || !view?.focus) {
      return false;
    }

    const settings = { ...DEFAULT_TRANSITION, ...transitionSettings };
    const destinationPosition = copyVector(view.position);
    const destinationFocus = copyVector(view.focus);
    const destinationPan = { ...pan, ...view.idlePan };

    if (settings.duration === 0) {
      basePosition = destinationPosition;
      applyCameraPose(basePosition, destinationFocus);
      pan = destinationPan;
      transition = null;
      idleStartedAt = nowSeconds;
      return true;
    }

    transition = {
      fromPosition: copyVector(camera.position),
      toPosition: destinationPosition,
      fromFocus: copyVector(focus),
      toFocus: destinationFocus,
      startedAt: nowSeconds,
      duration: settings.duration,
      easing: settings.easing,
      toPan: destinationPan,
    };

    return true;
  }

  function update(nowSeconds) {
    if (!transition) {
      if (idleStartedAt === null) {
        idleStartedAt = nowSeconds;
      }

      const phase = ((nowSeconds - idleStartedAt) / pan.period) * Math.PI * 2;
      const offset = pan.amplitude * Math.sin(phase);
      const position = copyVector(basePosition);
      position[pan.axis] += offset;
      camera.position.set(position.x, position.y, position.z);
      camera.lookAt(focus.x, focus.y, focus.z);
      return false;
    }

    const elapsed = Math.max(0, nowSeconds - transition.startedAt);
    const linearProgress = Math.min(elapsed / transition.duration, 1);
    const progress = easeProgress(linearProgress, transition.easing);
    const position = lerpVector(transition.fromPosition, transition.toPosition, progress);
    const nextFocus = lerpVector(transition.fromFocus, transition.toFocus, progress);

    applyCameraPose(position, nextFocus);

    if (linearProgress >= 1) {
      basePosition = copyVector(transition.toPosition);
      focus = copyVector(transition.toFocus);
      pan = transition.toPan;
      transition = null;
      idleStartedAt = nowSeconds;
      return false;
    }

    return true;
  }

  return {
    start,
    update,
    setFocus,
    isBusy() {
      return transition !== null;
    },
    getView() {
      return {
        position: copyVector(transition ? camera.position : basePosition),
        focus: copyVector(focus),
        idlePan: { ...pan },
      };
    },
  };
}
