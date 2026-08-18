import { IMAGE_WIDTHS } from './imageSizes.mjs';

/** 표시 폭 × 이 값 = 실제로 요청할 픽셀 폭. 요즘 폰은 대부분 DPR 2 이상이라 2 로 둡니다. */
const DPR = 2;

/**
 * `/_next/image` 는 basePath 아래로 서빙됩니다. next.config.mjs 의 `basePath` 와 같아야 합니다.
 * (`<Image />` 는 이걸 알아서 붙이지만, 여기서는 URL 을 직접 만들기 때문에 명시합니다.)
 */
const IMAGE_ENDPOINT = '/app/_next/image';

/**
 * 2열 작품 카드의 표시 폭(px) — 저장 목록·보드 상세·보드 담기가 같은 그리드를 씁니다.
 * `max-w-md`(448) − `px-4`(32) − `gap-x-2`(8) 를 2로 나눈 값. astro 탐색 그리드와 같습니다.
 */
export const ARTWORK_CARD_WIDTH = 204;

/**
 * CDN 원본 이미지 URL 을 표시 크기에 맞춘 최적화 URL 로 바꿉니다.
 *
 * 작품 사진은 원본이 장당 최대 2.4MB 인데 화면에서는 28~204px 폭으로만 쓰입니다.
 * Next Image Optimization 을 거쳐 webp + 폭 맞춤으로 내려받게 합니다.
 *
 * `<Image />` 대신 URL 을 직접 만드는 이유: 썸네일은 공용 `SkeletonImage`(로딩 스켈레톤 + 깨진 이미지
 * 처리)를 통해 그려지는데, 이걸 `<Image />` 로 바꾸면 astro 앱까지 함께 손봐야 합니다.
 * 호출부에서 URL 만 갈아끼우면 astro 와 같은 방식(apps/user/astro/src/lib/imageUrl.ts)이 됩니다.
 *
 * @param src API 가 내려준 이미지 URL. 없으면 undefined 를 그대로 돌려줍니다.
 * @param cssWidth 화면에 표시되는 CSS 폭(px). 레티나 배수와 허용 폭 스냅은 이 함수가 처리합니다.
 */
export function optimizedImageUrl(
  src: string | null | undefined,
  cssWidth: number,
  quality = 75,
): string | undefined {
  if (!src) return undefined;
  // 절대 URL 만 최적화 대상. /app/images/*.svg 같은 로컬 정적 파일은 이미 작다.
  if (!/^https?:\/\//.test(src)) return src;

  const target = cssWidth * DPR;
  const width = IMAGE_WIDTHS.find((w) => w >= target) ?? Math.max(...IMAGE_WIDTHS);
  return `${IMAGE_ENDPOINT}?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
