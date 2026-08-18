import assert from 'node:assert/strict';
import test from 'node:test';

import { getMetadataOrigin } from './metadataOrigin.ts';

test('배포용 origin 설정을 사용한다', () => {
  assert.equal(
    getMetadataOrigin('https://dev.dearbloom.co.kr/', new Headers({ host: 'localhost:3000' })),
    'https://dev.dearbloom.co.kr',
  );
});

test('localhost origin 설정은 요청 host로 대체한다', () => {
  assert.equal(
    getMetadataOrigin(
      'http://localhost:4321',
      new Headers({ host: 'dev.dearbloom.co.kr', 'x-forwarded-proto': 'https' }),
    ),
    'https://dev.dearbloom.co.kr',
  );
});
