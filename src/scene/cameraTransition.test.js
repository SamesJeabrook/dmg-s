import test from 'node:test';
import assert from 'node:assert/strict';

import { createCameraTransition } from './cameraTransition.js';

function createTestCamera() {
  return {
    position: {
      x: 0,
      y: 1.4,
      z: 8,
      set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
      },
    },
    lookAt(x, y, z) {
      this.focus = { x, y, z };
    },
  };
}

test('idle pan moves back and forth around the home camera position', () => {
  const camera = createTestCamera();
  const motion = createCameraTransition(camera, { x: 0, y: 0, z: 0 }, {
    axis: 'x',
    amplitude: 0.1,
    period: 8,
  });

  motion.update(0);
  motion.update(2);
  assert.ok(Math.abs(camera.position.x - 0.1) < 1e-8);
  motion.update(6);
  assert.ok(Math.abs(camera.position.x + 0.1) < 1e-8);
  assert.deepEqual(camera.focus, { x: 0, y: 0, z: 0 });
});

test('idle pan restarts around a destination after a transition', () => {
  const camera = createTestCamera();
  const motion = createCameraTransition(camera, { x: 0, y: 0, z: 0 }, {
    axis: 'x',
    amplitude: 0.1,
    period: 8,
  });

  motion.update(0);
  assert.equal(motion.start({
    position: { x: 2, y: 1, z: 6 },
    focus: { x: 0, y: 0, z: 0 },
  }, 0, { duration: 2, easing: 'linear' }), true);
  motion.update(2);
  assert.deepEqual(motion.getView().position, { x: 2, y: 1, z: 6 });
  motion.update(4);
  assert.ok(Math.abs(camera.position.x - 2.1) < 1e-8);
});

test('saved camera views use the settled base position, not the current pan offset', () => {
  const camera = createTestCamera();
  const motion = createCameraTransition(camera, { x: 0, y: 0, z: 0 }, {
    axis: 'x',
    amplitude: 0.1,
    period: 8,
  });

  motion.update(0);
  motion.update(2);

  assert.ok(Math.abs(camera.position.x - 0.1) < 1e-8);
  assert.deepEqual(motion.getView().position, { x: 0, y: 1.4, z: 8 });
});
