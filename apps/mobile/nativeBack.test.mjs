import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getAndroidBackAction,
  parseNativeNavigationState,
} from './nativeBack.ts';

test('Android 뒤로가기는 Next SPA와 WebView 문서 기록을 함께 사용한다', () => {
  assert.equal(getAndroidBackAction(true, false), 'go-back');
  assert.equal(getAndroidBackAction(false, true), 'go-back');
  assert.equal(getAndroidBackAction(false, false), 'confirm-exit');
});

test('웹의 내부 navigation 상태만 Android back에 반영한다', () => {
  assert.equal(parseNativeNavigationState('{"type":"NATIVE_NAVIGATION_STATE","hasInternalBack":true}'), true);
  assert.equal(parseNativeNavigationState('{"type":"NATIVE_NAVIGATION_STATE","hasInternalBack":false}'), false);
  assert.equal(parseNativeNavigationState('{"type":"OTHER","hasInternalBack":true}'), undefined);
});
