import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * 지역 태그(칩) — 작품 목록/상세 등에서 지역을 표시하는 공통 칩.
 * 피그마 chip_location(default) 규격: Body5(14/500), bg neutral-200, text neutral-800, rounded-full.
 */
export function RegionTag({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md bg-neutral-100 px-2 py-0.5 text-body-6 text-neutral-600',
        className,
      )}
      {...props}
    />
  );
}
