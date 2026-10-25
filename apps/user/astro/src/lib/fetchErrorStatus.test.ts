import assert from 'node:assert/strict';
import test from 'node:test';
import { pageStatusForFetchError } from './fetchErrorStatus.ts';

test('없는 작품으로 확정된 응답은 404', () => {
  assert.equal(pageStatusForFetchError(400), 404);
  assert.equal(pageStatusForFetchError(404), 404);
  assert.equal(pageStatusForFetchError(410), 404);
});

test('일시적인 실패는 503 으로 두어 색인에서 빠지지 않게 한다', () => {
  assert.equal(pageStatusForFetchError(429), 503);
  assert.equal(pageStatusForFetchError(408), 503);
  assert.equal(pageStatusForFetchError(500), 503);
  assert.equal(pageStatusForFetchError(undefined), 503);
});
