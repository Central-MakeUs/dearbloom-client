/**
 * dearBloom 공통 Tailwind 프리셋.
 * 모든 앱은 이 프리셋을 상속받아 색상/폰트 토큰을 공유합니다.
 * 헥사코드 직접 사용 금지 — 이 파일 안에서만 정의하고, 코드에서는 토큰 클래스(예: text-brand)를 사용하세요.
 */

// eslint-disable-next-line no-restricted-syntax -- 디자인 토큰은 여기에만 정의
const palette = {
  brand: { DEFAULT: '#7C5CFF', light: '#9B85FF', dark: '#6A4DE8' },
  ink: '#111418',
  sub: '#6B7280',
  line: '#E5E7EB',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#0EA5E9',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: palette,
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'Apple SD Gothic Neo', 'sans-serif'],
      },
    },
  },
};
