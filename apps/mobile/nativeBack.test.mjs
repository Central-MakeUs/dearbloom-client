import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createNativeExitRequestScript,
  getAndroidBackAction,
  isNativeExitConfirm,
} from './nativeBack.ts';

test('Android 뒤로가기는 WebView 기록을 먼저 사용한다', () => {
  assert.equal(getAndroidBackAction(true), 'go-back');
  assert.equal(getAndroidBackAction(false), 'confirm-exit');
});

test('종료 확인 브릿지는 정해진 메시지만 허용한다', () => {
  assert.match(createNativeExitRequestScript(), /NATIVE_EXIT_REQUEST/);
  assert.equal(isNativeExitConfirm('NATIVE_EXIT_CONFIRM'), true);
  assert.equal(isNativeExitConfirm('{"type":"NATIVE_EXIT_CONFIRM"}'), true);
  assert.equal(isNativeExitConfirm('{"type":"OTHER"}'), false);
  assert.equal(isNativeExitConfirm('invalid'), false);
});
