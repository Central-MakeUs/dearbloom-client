import assert from 'node:assert/strict';
import test from 'node:test';

import { getSessionWebViewUrl } from './nativeSession.ts';

const snapsUrl = 'https://dearbloom.co.kr/snaps';

test('작가 세션은 작가 대시보드에서 재개한다', () => {
  assert.equal(
    getSessionWebViewUrl(snapsUrl, {
      activeRole: { value: 'ARTIST' },
      refreshToken: { value: 'refresh-token' },
    }),
    'https://dearbloom.co.kr/app/artist/dashboard',
  );
});

test('고객 세션과 비로그인 상태는 탐색에서 시작한다', () => {
  assert.equal(
    getSessionWebViewUrl(snapsUrl, {
      accessToken: { value: 'access-token' },
      activeRole: { value: 'CUSTOMER' },
    }),
    snapsUrl,
  );
  assert.equal(getSessionWebViewUrl(snapsUrl, { activeRole: { value: 'ARTIST' } }), snapsUrl);
});
