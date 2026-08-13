import assert from 'node:assert/strict';
import test from 'node:test';
import { getSlotTimes, getStartTimes } from './inquirySlots.ts';

test('패키지 시간만큼 연속으로 비어 있는 시작 시각만 반환한다', () => {
  assert.deepEqual(getStartTimes(['09:00:00', '09:30:00', '10:30:00'], 2, 30), ['09:00']);
});

test('시작 시각부터 패키지 시간만큼 선택할 셀을 반환한다', () => {
  assert.deepEqual(getSlotTimes('10:00', 2, 30), ['10:00', '10:30']);
});
