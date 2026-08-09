import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * 프리셋(@dearbloom/config)에서 정의한 커스텀 폰트 스케일.
 *
 * tailwind-merge 는 기본적으로 `text-sm` 같은 표준 스케일만 font-size 로 인식한다.
 * 등록하지 않으면 `text-caption-1` 을 **글자색**으로 오인해서
 * `cn('text-caption-1 text-neutral-800')` 이 `text-neutral-800` 으로 뭉개진다(크기 소실).
 */
const FONT_SIZES = [
  'head-1',
  'head-2',
  'head-3',
  'body-1',
  'body-2',
  'body-3',
  'body-4',
  'body-5',
  'body-6',
  'caption-1',
  'caption-2',
  'caption-3',
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZES }] } },
});

/**
 * Tailwind 클래스 병합 유틸리티.
 *
 * @example
 *   cn('px-2 py-1', condition && 'bg-primary', 'text-white')
 *   → 조건부 클래스 + tailwind-merge 로 충돌 해결
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
