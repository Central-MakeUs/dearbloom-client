import * as React from 'react';
import { cn } from '../../lib/cn';

export interface RegionTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * 글자 크기. Figma 가 화면마다 다른 스펙을 쓴다.
   * - `md`(기본): Body5_m_14 — 작품상세 지역칩/학교칩 (Figma 1426:14783, H25)
   * - `sm`: Caption1_m_12 — 탐색 카드 지역칩 (Figma 437:7540, H22)
   */
  size?: 'sm' | 'md';
}

/**
 * 지역 태그(칩) — 작품 목록/상세 등에서 지역을 표시하는 공통 칩.
 * 공통: bg primary-100, text neutral-800, radius 4, padding 8/2.
 */
export function RegionTag({ className, size = 'md', ...props }: RegionTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm bg-primary-100 px-2 py-0.5 text-neutral-800',
        size === 'sm' ? 'text-caption-1' : 'text-body-5',
        className,
      )}
      {...props}
    />
  );
}
