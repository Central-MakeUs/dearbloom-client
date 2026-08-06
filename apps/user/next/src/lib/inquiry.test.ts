import assert from 'node:assert/strict';
import test from 'node:test';
import { ampmTimeLabel, durationLabel } from './inquiry.ts';

test('문의 화면 시간과 촬영 시간을 한국어 형식으로 표시한다', () => {
  assert.equal(ampmTimeLabel('13:30:00'), '오후 01:30');
  assert.equal(durationLabel(90), '1시간 30분');
});
