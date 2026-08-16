import assert from 'node:assert/strict';
import test from 'node:test';

import { customerNameSchema, nicknameSchema } from './validation.ts';

test('고객 이름은 2~5자 한글 또는 영문만 허용한다', () => {
  assert.equal(customerNameSchema.safeParse('김디어').success, true);
  assert.equal(customerNameSchema.safeParse('디어블룸이').success, true);
  assert.equal(customerNameSchema.safeParse('김').success, false);
  assert.equal(customerNameSchema.safeParse('DearBloom').success, false);
  assert.equal(customerNameSchema.safeParse('김 디어').success, false);
  assert.equal(customerNameSchema.safeParse('디어1').success, false);
});

// 서버 규칙: 2-12자의 한글, 영문, 숫자, _ 와 단어 사이 공백.
test('작가 닉네임은 숫자·언더스코어·단어 사이 공백을 허용한다', () => {
  assert.equal(nicknameSchema.safeParse('쁘띠필름').success, true);
  assert.equal(nicknameSchema.safeParse('김은아 스냅').success, true);
  assert.equal(nicknameSchema.safeParse('스냅 1985').success, true);
  assert.equal(nicknameSchema.safeParse('스냅_하우스').success, true);
  assert.equal(nicknameSchema.safeParse('가나다라마바 사아자차카').success, true); // 공백 포함 12자
});

test('작가 닉네임은 앞뒤·연속 공백과 특수문자를 막는다', () => {
  assert.equal(nicknameSchema.safeParse(' 스냅 ').success, false);
  assert.equal(nicknameSchema.safeParse('스냅  하우스').success, false);
  assert.equal(nicknameSchema.safeParse('스냅!').success, false);
  assert.equal(nicknameSchema.safeParse('김').success, false);
  assert.equal(nicknameSchema.safeParse('가나다라마바사아자차카타파').success, false); // 13자
});
