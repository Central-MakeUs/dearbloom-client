import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

/**
 * 프리셋(`packages/config/tailwind.preset.mjs`)에 정의한 폰트 크기 토큰들.
 *
 * tailwind-merge 는 이 이름들을 모르기 때문에 `text-caption-2` 를 폰트 크기가 아니라
 * **글자색**으로 오분류한다. 그러면 `text-caption-2 ... text-neutral-600` 처럼 한 번에 합쳐질 때
 * 둘이 같은 그룹으로 취급돼 뒤엣값만 남고 폰트 크기가 통째로 사라진다.
 * (Badge 의 12px 이 사라져 16px 로 커지고, primary 버튼의 `text-neutral-0` 이 사라져
 *  녹색 배경에 어두운 글자가 나오던 버그가 전부 여기서 비롯됐다.)
 *
 * 토큰을 추가하면 이 배열에도 반드시 추가할 것.
 */
const FONT_SIZE_TOKENS = [
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
  extend: { classGroups: { 'font-size': [{ text: FONT_SIZE_TOKENS }] } },
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
