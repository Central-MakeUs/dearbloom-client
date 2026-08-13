import type { SharedComment } from '@dearbloom/shared';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatSharedCommentTime(createdAt: string, now = new Date()) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return '';

  const elapsed = Math.max(0, now.getTime() - created.getTime());
  if (elapsed < MINUTE) return '방금 전';
  if (elapsed < HOUR) return `${Math.floor(elapsed / MINUTE)}분 전`;
  if (elapsed < DAY) return `${Math.floor(elapsed / HOUR)}시간 전`;
  if (elapsed < 7 * DAY) return `${Math.floor(elapsed / DAY)}일 전`;
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).format(created);
}

export const sortSharedCommentsNewestFirst = <T extends Pick<SharedComment, 'createdAt'>>(
  comments: T[],
) => [...comments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
