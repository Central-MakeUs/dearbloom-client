import assert from 'node:assert/strict';
import test from 'node:test';
import { formatSharedCommentTime, sortSharedCommentsNewestFirst } from './sharedComments.ts';

const now = new Date('2026-08-12T12:00:00Z');

test('댓글 시간은 1시간, 하루, 7일 경계에서 SNS 형식으로 바뀐다', () => {
  assert.equal(formatSharedCommentTime('2026-08-12T11:59:31Z', now), '방금 전');
  assert.equal(formatSharedCommentTime('2026-08-12T11:00:01Z', now), '59분 전');
  assert.equal(formatSharedCommentTime('2026-08-11T12:00:01Z', now), '23시간 전');
  assert.equal(formatSharedCommentTime('2026-08-05T12:00:01Z', now), '6일 전');
  assert.match(formatSharedCommentTime('2026-08-05T12:00:00Z', now), /2026.*8.*5/);
});

test('댓글은 최신 작성 순으로 정렬하며 원본 배열은 바꾸지 않는다', () => {
  const comments = [{ createdAt: '2026-08-11T12:00:00Z' }, { createdAt: '2026-08-12T12:00:00Z' }];
  const sorted = sortSharedCommentsNewestFirst(comments);

  assert.equal(sorted[0]?.createdAt, '2026-08-12T12:00:00Z');
  assert.equal(comments[0]?.createdAt, '2026-08-11T12:00:00Z');
});
