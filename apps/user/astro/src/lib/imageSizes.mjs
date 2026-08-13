/**
 * Vercel Image Optimization 이 허용하는 이미지 폭 목록.
 *
 * `/_vercel/image?w=` 는 여기 없는 값을 거절하므로, 화면에서 쓰는 폭은 전부 이 배열에 있어야 합니다.
 * astro.config.mjs(`imagesConfig.sizes`)와 imageUrl.ts(폭 스냅)가 같은 값을 봐야 해서 별도 파일로 뺐습니다.
 *
 * 값은 실제 표시 폭 × 2(레티나) 기준: 리스트 사진 120→240, 다른작품 133→320,
 * 상세 캐러셀 190→384, 그리드 카드 204→480. 640 이상은 향후 전폭 이미지용 여유분.
 *
 * @type {number[]}
 */
export const IMAGE_WIDTHS = [240, 320, 384, 480, 640, 828, 1080];
