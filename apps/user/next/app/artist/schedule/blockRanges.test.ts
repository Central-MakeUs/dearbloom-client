import assert from 'node:assert/strict';
import test from 'node:test';

import { planBlockAdd } from './blockRanges.ts';

const existing = [{ id: 1, start: '12:00', end: '13:00' }];

test('겹치는 일정이 없으면 그대로 추가한다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '15:00', end: '16:00' }), {
    action: 'add',
    start: '15:00',
    end: '16:00',
    removeIds: [],
  });
});

test('시간이 완전히 같으면 추가하지 않는다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '12:00', end: '13:00' }), { action: 'skip' });
});

test('기존 일정 안에 들어가면 기존을 유지한다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '12:30', end: '13:00' }), { action: 'skip' });
});

test('신규가 더 넓으면 신규 범위로 바꾼다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '11:00', end: '14:00' }), {
    action: 'add',
    start: '11:00',
    end: '14:00',
    removeIds: [1],
  });
});

test('일부만 겹치면 하나로 합친다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '12:30', end: '14:00' }), {
    action: 'add',
    start: '12:00',
    end: '14:00',
    removeIds: [1],
  });
});

test('여러 일정에 걸치면 모두 합친다', () => {
  const many = [
    { id: 1, start: '09:00', end: '10:00' },
    { id: 2, start: '12:00', end: '13:00' },
    { id: 3, start: '14:00', end: '15:00' },
  ];
  assert.deepEqual(planBlockAdd(many, { start: '09:30', end: '14:30' }), {
    action: 'add',
    start: '09:00',
    end: '15:00',
    removeIds: [1, 2, 3],
  });
});

test('끝과 시작이 맞닿기만 하면 합치지 않는다', () => {
  assert.deepEqual(planBlockAdd(existing, { start: '13:00', end: '14:00' }), {
    action: 'add',
    start: '13:00',
    end: '14:00',
    removeIds: [],
  });
});
