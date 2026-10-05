import test from 'node:test';
import assert from 'node:assert/strict';

import { createOrbitTimeline, getOrbitPose } from './cameraOrbit.js';

const config = {
  start: { x: 0, y: 1.4, z: 8 },
  stops: [
    { x: -3.2, y: 1.8, z: 6.8, dwell: 2 },
    { x: 3.2, y: 1.2, z: 7.8, dwell: 2 },
  ],
  segmentDuration: 1,
};

test('starts at the configured origin pose', () => {
  const pose = getOrbitPose(0, config);

  assert.equal(pose.position.x, 0);
  assert.equal(pose.position.y, 1.4);
  assert.equal(pose.position.z, 8);
});

test('holds at a stop before continuing', () => {
  const orbit = createOrbitTimeline(config);
  const pose = getOrbitPose(2.5, config);

  assert.ok(Math.abs(pose.position.x + 3.2) < 0.001, `Expected x to be near -3.2 but got ${pose.position.x}`);
  assert.ok(Math.abs(pose.position.y - 1.8) < 0.001, `Expected y to be near 1.8 but got ${pose.position.y}`);
  assert.ok(Math.abs(pose.position.z - 6.8) < 0.001, `Expected z to be near 6.8 but got ${pose.position.z}`);
  assert.equal(orbit.totalDuration > 0, true);
});

test('returns to the initial position after the final stop', () => {
  const orbit = createOrbitTimeline(config);
  const pose = getOrbitPose(orbit.totalDuration, config);

  assert.ok(Math.abs(pose.position.x) < 0.001, `Expected x to be near 0 but got ${pose.position.x}`);
  assert.ok(Math.abs(pose.position.y - 1.4) < 0.001, `Expected y to be near 1.4 but got ${pose.position.y}`);
  assert.ok(Math.abs(pose.position.z - 8) < 0.001, `Expected z to be near 8 but got ${pose.position.z}`);
});
