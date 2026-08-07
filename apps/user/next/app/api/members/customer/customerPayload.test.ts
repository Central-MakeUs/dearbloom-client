import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCustomerPayload } from './customerPayload.ts';

test('고객 onboarding payload의 학교, 지역을 검증한다', () => {
  assert.deepEqual(parseCustomerPayload({ region: 'SEOUL', universityId: 1 }), {
    region: 'SEOUL',
    universityId: 1,
  });
  assert.deepEqual(parseCustomerPayload({}), {});
  assert.equal(parseCustomerPayload({ region: 'UNKNOWN' }), undefined);
  assert.equal(parseCustomerPayload({ universityId: 0 }), undefined);
});
