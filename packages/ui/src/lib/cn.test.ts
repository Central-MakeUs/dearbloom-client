import assert from 'node:assert/strict';
import test from 'node:test';

import { cn } from './cn.ts';

// tailwind-merge 기본 설정은 커스텀 폰트 토큰(text-caption-2 등)을 "글자색"으로 오분류해서
// 뒤따라오는 text-<color> 와 충돌시켜 지워버린다. 프리셋 토큰을 font-size 그룹에 등록했는지 지킨다.
test('폰트 크기 토큰은 글자색 클래스와 함께 써도 살아남는다', () => {
  const badge = cn('rounded-sm px-1.5 py-0.5 text-caption-2 font-medium', 'bg-neutral-100 text-neutral-600');
  assert.match(badge, /text-caption-2/);
  assert.match(badge, /text-neutral-600/);

  // 반대 순서(색 → 크기)도 마찬가지
  const button = cn('text-body-5', 'bg-primary text-neutral-0', 'h-[52px] px-5 text-body-1');
  assert.match(button, /text-neutral-0/);
});

test('폰트 크기끼리는 여전히 뒤엣값이 이긴다', () => {
  assert.equal(cn('text-caption-2', 'text-body-4'), 'text-body-4');
  assert.equal(cn('text-sm', 'text-body-4'), 'text-body-4');
});

test('글자색끼리는 여전히 뒤엣값이 이긴다', () => {
  assert.equal(cn('text-neutral-600', 'text-primary'), 'text-primary');
});
