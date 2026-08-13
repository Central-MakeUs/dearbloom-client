import assert from 'node:assert/strict';
import test from 'node:test';
import { buildSlotGrid } from './slots.ts';

test('촬영 시작 시간 24개를 09:00부터 20:30까지 만든다', () => {
  const slots = buildSlotGrid(30);
  assert.equal(slots.length, 24);
  assert.deepEqual([slots.at(0), slots.at(-1)], ['09:00', '20:30']);
});
