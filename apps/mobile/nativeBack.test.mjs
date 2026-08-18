import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createNativeExitRequestScript,
  getAndroidBackAction,
  isNativeExitConfirm,
  parseNativeNavigationState,
} from './nativeBack.ts';

test('Android 뒤로가기는 DearBloom 내부 기록만 사용한다', () => {
  assert.equal(getAndroidBackAction(true), 'go-back');
  assert.equal(getAndroidBackAction(false), 'confirm-exit');
});

test('웹의 내부 navigation 상태만 Android back에 반영한다', () => {
  assert.equal(parseNativeNavigationState('{"type":"NATIVE_NAVIGATION_STATE","hasInternalBack":true}'), true);
  assert.equal(parseNativeNavigationState('{"type":"NATIVE_NAVIGATION_STATE","hasInternalBack":false}'), false);
  assert.equal(parseNativeNavigationState('{"type":"OTHER","hasInternalBack":true}'), undefined);
});

test('종료 확인 브릿지는 정해진 메시지만 허용한다', () => {
  assert.match(createNativeExitRequestScript(), /NATIVE_EXIT_REQUEST/);
  assert.equal(isNativeExitConfirm('NATIVE_EXIT_CONFIRM'), true);
  assert.equal(isNativeExitConfirm('{"type":"NATIVE_EXIT_CONFIRM"}'), true);
  assert.equal(isNativeExitConfirm('{"type":"OTHER"}'), false);
  assert.equal(isNativeExitConfirm('invalid'), false);
});
