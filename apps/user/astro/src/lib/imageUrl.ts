import { IMAGE_WIDTHS } from './imageSizes.mjs';

/** 표시 폭 × 이 값 = 실제로 요청할 픽셀 폭. 요즘 폰은 대부분 DPR 2 이상이라 2 로 둡니다. */
const DPR = 2;

/**
 * CDN 원본 이미지 URL 을 표시 크기에 맞춘 최적화 URL 로 바꿉니다.
 *
 * 작품 사진은 원본이 장당 최대 2.4MB 인데 화면에서는 120~204px 폭으로만 쓰입니다.
 * Vercel Image Optimization(`/_vercel/image`)을 거쳐 webp + 폭 맞춤으로 내려받게 합니다.
 *
 * `<Image />`(astro:assets) 대신 URL 을 직접 만드는 이유: 목록은 ArtworkFeed 가 커서
 * 페이지네이션으로 브라우저에서 그리므로, 빌드/SSR 시점에 도는 astro:assets 로는 2페이지 이후를 덮을 수 없습니다.
 *
 * @param src API 가 내려준 이미지 URL. 없으면 undefined 를 그대로 돌려줍니다.
 * @param cssWidth 화면에 표시되는 CSS 폭(px). 레티나 배수와 허용 폭 스냅은 이 함수가 처리합니다.
 */
export function optimizedImageUrl(src: string | null | undefined, cssWidth: number, quality = 75): string | undefined {
  if (!src) return undefined;
  // dev 서버에는 /_vercel/image 가 없다(Vercel 런타임 기능) → 원본 그대로.
  if (import.meta.env.DEV) return src;
  // 절대 URL 만 최적화 대상. /images/*.svg 같은 로컬 정적 파일은 이미 작다.
  if (!/^https?:\/\//.test(src)) return src;

  const target = cssWidth * DPR;
  const width = IMAGE_WIDTHS.find((w) => w >= target) ?? Math.max(...IMAGE_WIDTHS);
  return `/_vercel/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}
