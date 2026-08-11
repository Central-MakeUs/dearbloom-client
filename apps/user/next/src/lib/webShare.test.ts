import assert from 'node:assert/strict';
import test from 'node:test';
import { isMobileShareDevice, isShareCancelled } from './webShare.ts';

test('공유 취소만 오류 토스트 대상에서 제외한다', () => {
  assert.equal(isShareCancelled({ name: 'AbortError' }), true);
  assert.equal(isShareCancelled({ name: 'NotAllowedError' }), false);
});

test('카카오 공유는 모바일과 네이티브 앱에서만 노출한다', () => {
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Macintosh)', 0), false);
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Linux; Android 15)', 5), true);
  assert.equal(isMobileShareDevice('Mozilla/5.0 (Macintosh)', 5), true);
  assert.equal(isMobileShareDevice('Mozilla/5.0', 0, 'ios'), true);
});
