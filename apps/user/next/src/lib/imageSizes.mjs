/**
 * Next Image Optimization(`/_next/image`)이 허용하는 이미지 폭 목록.
 *
 * `?w=` 는 `deviceSizes ∪ imageSizes` 에 없는 값을 400 으로 거절하므로,
 * 화면에서 쓰는 폭은 전부 이 배열에 있어야 합니다.
 * next.config.mjs(`images.imageSizes`)와 imageUrl.ts(폭 스냅)가 같은 값을 봐야 해서 별도 파일로 뺐습니다.
 *
 * 값은 실제 표시 폭 × 2(레티나) 기준: 신청 아바타 28→64, 작가 프로필 48→96,
 * 작품 목록 썸네일 64→128, 프로필 편집 80→160, 보드 콜라주 셀 100→240, 카드 그리드 204→480.
 *
 * astro 앱은 `/_vercel/image` 를 쓰고 폭 목록도 따로 관리합니다(apps/user/astro/src/lib/imageSizes.mjs).
 * 엔드포인트가 다르므로 두 배열을 합치지 마세요.
 *
 * @type {number[]}
 */
export const IMAGE_WIDTHS = [64, 96, 128, 160, 240, 480];
