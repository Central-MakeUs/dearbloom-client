import assert from 'node:assert/strict';
import test from 'node:test';

import { getInviteWebViewUrl } from './nativeDeepLink.ts';

test('초대 딥링크를 현재 WebView 도메인의 초대 화면으로 연다', () => {
  assert.equal(
    getInviteWebViewUrl('dearbloom://invite/XAK6PD', 'http://192.168.0.13:3000/snaps'),
    'http://192.168.0.13:3000/app/invite/XAK6PD',
  );
  assert.equal(
    getInviteWebViewUrl('dearbloom://invite/XAK6PD', 'https://dev.dearbloom.co.kr/snaps'),
    'https://dev.dearbloom.co.kr/app/invite/XAK6PD',
  );
});

test('디어블룸 초대가 아닌 링크는 무시한다', () => {
  assert.equal(getInviteWebViewUrl('https://example.com', 'https://dearbloom.co.kr/snaps'), undefined);
  assert.equal(getInviteWebViewUrl('dearbloom://invite/a/b', 'https://dearbloom.co.kr/snaps'), undefined);
});
