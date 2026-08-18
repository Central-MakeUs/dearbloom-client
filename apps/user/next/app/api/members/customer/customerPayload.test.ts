import assert from 'node:assert/strict';
import test from 'node:test';

import { parseCustomerPayload } from './customerPayload.ts';

test('고객 onboarding payload의 이름, 학교, 지역을 검증한다', () => {
  assert.deepEqual(parseCustomerPayload({ name: ' 김디어 ', region: 'SEOUL', universityId: 1 }), {
    name: '김디어',
    region: 'SEOUL',
    universityId: 1,
  });
  assert.deepEqual(parseCustomerPayload({ name: '디어' }), { name: '디어' });
  assert.equal(parseCustomerPayload({}), undefined);
  assert.equal(parseCustomerPayload({ name: '김1', region: 'SEOUL' }), undefined);
  assert.equal(parseCustomerPayload({ name: '김디어', region: 'UNKNOWN' }), undefined);
  assert.equal(parseCustomerPayload({ name: '김디어', universityId: 0 }), undefined);
});
