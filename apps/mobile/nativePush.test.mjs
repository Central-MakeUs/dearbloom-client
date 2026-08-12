import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createPushTokenResultScript,
  getPushDeepLinkWebViewUrl,
  isNativePushRegisterRequest,
} from './nativePush.ts';

const webViewUrl = 'https://dearbloom.co.kr/snaps';

test('푸시 등록 요청은 문자열과 JSON 두 형태를 모두 인식한다', () => {
  assert.equal(isNativePushRegisterRequest('NATIVE_PUSH_REGISTER'), true);
  assert.equal(isNativePushRegisterRequest(JSON.stringify({ type: 'NATIVE_PUSH_REGISTER' })), true);
  assert.equal(isNativePushRegisterRequest(JSON.stringify({ type: 'NATIVE_SHARE' })), false);
  assert.equal(isNativePushRegisterRequest('그냥 문자열'), false);
});

test('토큰 결과 스크립트는 < 를 이스케이프해 주입한다', () => {
  const script = createPushTokenResultScript({
    type: 'NATIVE_PUSH_TOKEN_RESULT',
    status: 'granted',
    platform: 'IOS',
    token: '<script>',
  });

  assert.ok(script.includes('NATIVE_PUSH_TOKEN_RESULT'));
  assert.ok(!script.includes('<script>'));
  assert.ok(script.includes('\\u003cscript>'));
});

test('딥링크는 같은 오리진의 내부 절대경로만 연다', () => {
  assert.equal(
    getPushDeepLinkWebViewUrl('/app/artist/requests/123', webViewUrl),
    'https://dearbloom.co.kr/app/artist/requests/123',
  );
  assert.equal(
    getPushDeepLinkWebViewUrl('/app/my/inquiries/9', webViewUrl),
    'https://dearbloom.co.kr/app/my/inquiries/9',
  );
});

test('외부 주소나 우회 경로는 열지 않는다', () => {
  assert.equal(getPushDeepLinkWebViewUrl('https://evil.example/app', webViewUrl), undefined);
  assert.equal(getPushDeepLinkWebViewUrl('//evil.example/app', webViewUrl), undefined);
  assert.equal(getPushDeepLinkWebViewUrl('app/artist/requests/1', webViewUrl), undefined);
  assert.equal(getPushDeepLinkWebViewUrl('/app\\evil', webViewUrl), undefined);
  assert.equal(getPushDeepLinkWebViewUrl(undefined, webViewUrl), undefined);
  assert.equal(getPushDeepLinkWebViewUrl(123, webViewUrl), undefined);
});
