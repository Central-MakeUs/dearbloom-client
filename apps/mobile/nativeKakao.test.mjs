import assert from 'node:assert/strict';
import test from 'node:test';

import {
  createNativeKakaoAvailabilityResultScript,
  isNativeKakaoAvailabilityRequest,
} from './nativeKakao.ts';

test('카카오톡 설치 여부 요청만 인식한다', () => {
  assert.equal(
    isNativeKakaoAvailabilityRequest(JSON.stringify({ type: 'NATIVE_KAKAO_AVAILABILITY' })),
    true,
  );
  assert.equal(isNativeKakaoAvailabilityRequest(JSON.stringify({ type: 'NATIVE_SHARE' })), false);
  assert.equal(isNativeKakaoAvailabilityRequest('잘못된 JSON'), false);
});

test('카카오톡 설치 여부를 WebView 이벤트로 전달한다', () => {
  const script = createNativeKakaoAvailabilityResultScript(false);

  assert.ok(script.includes('NATIVE_KAKAO_AVAILABILITY_RESULT'));
  assert.ok(script.includes('available: false'));
});
