import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * 지역 태그(칩) — 작품 목록/상세 등에서 지역을 표시하는 공통 칩.
 * Figma 437:7469 실측: 12/500(caption-1), bg primary-100, text neutral-800, radius 4, padding 8/2 → h 22.
 */
export function RegionTag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-primary-100 px-2 py-0.5 text-caption-1 text-neutral-800',
        className,
      )}
      {...props}
    />
  );
}
