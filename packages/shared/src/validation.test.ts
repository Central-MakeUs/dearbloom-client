import assert from 'node:assert/strict';
import test from 'node:test';

import { customerNameSchema, nicknameSchema } from './validation.ts';

test('고객과 작가 이름은 한글 또는 영문만 허용한다', () => {
  for (const schema of [customerNameSchema, nicknameSchema]) {
    assert.equal(schema.safeParse('김디어').success, true);
    assert.equal(schema.safeParse('김').success, false);
    assert.equal(schema.safeParse('김 디어').success, false);
    assert.equal(schema.safeParse('디어1').success, false);
  }
});

test('작가 이름은 12글자까지, 고객 이름은 5글자까지 허용한다', () => {
  assert.equal(nicknameSchema.safeParse('DearBloom').success, true);
  assert.equal(nicknameSchema.safeParse('DearBloomName').success, false);

  assert.equal(customerNameSchema.safeParse('디어블룸이').success, true);
  assert.equal(customerNameSchema.safeParse('DearBloom').success, false);
});
