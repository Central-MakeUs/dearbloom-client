import assert from 'node:assert/strict';
import test from 'node:test';

import { getNativeShareContent, parseNativeShareRequest } from './nativeShare.ts';

const request = {
  type: 'NATIVE_SHARE',
  title: '우정스냅 보드',
  text: '공동보드에 초대했어요.',
  url: 'https://dearbloom.co.kr/app/invite/K7QM2X',
};

test('같은 오리진의 네이티브 공유 요청만 허용한다', () => {
  assert.deepEqual(
    parseNativeShareRequest(JSON.stringify(request), 'https://dearbloom.co.kr'),
    request,
  );
  assert.equal(
    parseNativeShareRequest(JSON.stringify({ ...request, url: 'https://evil.example' }), 'https://dearbloom.co.kr'),
    undefined,
  );
});

test('iOS는 url 필드, Android는 메시지에 링크를 포함한다', () => {
  assert.deepEqual(getNativeShareContent(request, 'ios'), {
    title: request.title,
    message: request.text,
    url: request.url,
  });
  assert.deepEqual(getNativeShareContent(request, 'android'), {
    title: request.title,
    message: `${request.text}\n${request.url}`,
  });
});
