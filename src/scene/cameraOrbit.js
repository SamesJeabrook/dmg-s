const DEFAULT_ORBIT_CONFIG = {
  start: { x: 2.5, y: 0, z: 6 },
  target: { x: 0, y: 0, z: 0 },
  stops: [
    { x: 2.75, y: 0.25, z: 6, dwell: 3 },
    { x: 5.2, y: 0.5, z: 4, dwell: 3 },
  ],
  segmentDuration: 5,
};

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

export function createOrbitTimeline(config = {}) {
  const merged = {
    ...DEFAULT_ORBIT_CONFIG,
    ...config,
    target: config.target ? { ...config.target } : { ...DEFAULT_ORBIT_CONFIG.target },
    stops: config.stops ? config.stops.map((stop) => ({ ...stop })) : DEFAULT_ORBIT_CONFIG.stops.map((stop) => ({ ...stop })),
  };

  const anchors = [
    { ...merged.start },
    ...merged.stops.map((stop) => ({ x: stop.x, y: stop.y, z: stop.z })),
    { ...merged.start },
  ];

  const timeline = [];
  let elapsed = 0;

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const from = anchors[index];
    const to = anchors[index + 1];

    timeline.push({
      type: 'move',
      start: elapsed,
      end: elapsed + merged.segmentDuration,
      duration: merged.segmentDuration,
      from,
      to,
    });

    elapsed += merged.segmentDuration;

    const stop = merged.stops[index];
    if (index < anchors.length - 2 && stop?.dwell) {
      timeline.push({
        type: 'hold',
        start: elapsed,
        end: elapsed + stop.dwell,
        duration: stop.dwell,
        from: { ...to },
        to: { ...to },
      });

      elapsed += stop.dwell;
    }
  }

  return {
    ...merged,
    totalDuration: elapsed,
    timeline,
  };
}

export function getOrbitPose(elapsedSeconds, config = {}) {
  const orbit = createOrbitTimeline(config);
  const cycle = orbit.totalDuration || 1;
  const wrapped = ((elapsedSeconds % cycle) + cycle) % cycle;

  if (wrapped >= cycle - 0.0001) {
    return {
      position: { ...orbit.start },
      target: { ...orbit.target },
    };
  }

  for (const step of orbit.timeline) {
    if (wrapped <= step.end) {
      const progress = step.type === 'hold'
        ? 0
        : Math.min(Math.max((wrapped - step.start) / step.duration, 0), 1);

      return {
        position: {
          x: lerp(step.from.x, step.to.x, progress),
          y: lerp(step.from.y, step.to.y, progress),
          z: lerp(step.from.z, step.to.z, progress),
        },
        target: { ...orbit.target },
      };
    }
  }

  const lastPoint = orbit.stops.at(-1) ?? orbit.start;

  return {
    position: { x: lastPoint.x, y: lastPoint.y, z: lastPoint.z },
    target: { ...orbit.target },
  };
}

export function animateOrbit(camera, elapsedSeconds, config = {}) {
  const pose = getOrbitPose(elapsedSeconds, config);

  camera.position.set(pose.position.x, pose.position.y, pose.position.z);
  camera.lookAt(pose.target.x, pose.target.y, pose.target.z);
}
