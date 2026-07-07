import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
