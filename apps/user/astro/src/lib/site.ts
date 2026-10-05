/**
 * 검색엔진에 노출할 정식 주소. canonical·sitemap·robots 는 배포 환경(dev·preview)과 무관하게 이 주소를 씁니다.
 * dev 서버는 vercel.json 의 X-Robots-Tag 로 색인을 막으므로 canonical 이 운영을 가리켜도 안전합니다.
 */
export const SITE_URL = 'https://dearbloom.co.kr';

export const SITE_NAME = 'DearBloom';

export const DEFAULT_DESCRIPTION = '디어블룸에서 졸업스냅 작가의 작품을 둘러보고 비교해 보세요.';
