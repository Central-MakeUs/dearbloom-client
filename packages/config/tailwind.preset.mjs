/**
 * dearBloom 공통 Tailwind 프리셋 (Figma 디자인 시스템 반영)
 *
 * 헥사코드 직접 사용 금지 — 이 파일 안에서만 정의하고, 코드에서는 토큰 클래스(예: text-primary, bg-neutral-100)를 사용하세요.
 */

/* eslint-disable no-restricted-syntax -- 디자인 토큰 정의는 이 파일에서만 허용 */

// Figma 최종 컬러 시스템: primary 6단계(50~500) + hover. 채도 미세 조정 반영.
const primary = {
  50: '#EEF3F0',
  100: '#E5EBE8',
  200: '#C9D9D1',
  300: '#A6C9B7',
  400: '#7AB898',
  500: '#296A48', // Primary (DEFAULT) — Figma 브랜드 그린(primary/primary)
  DEFAULT: '#296A48',
  hover: '#245E40', // 버튼 hover/pressed 상태
};

const neutral = {
  0: '#FFFFFF',
  100: '#F8F8F8',
  200: '#EAEAEA',
  300: '#D9D9D9',
  400: '#BDBDBD',
  500: '#9A9A9A',
  600: '#767676',
  700: '#5A5A5A',
  800: '#3F3F3F',
  900: '#2A2A2A',
  950: '#1F1F1F',
};

const semantic = {
  error: '#EC4141',
  danger: '#EA0E2F',
  success: '#0CC76C',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {
      colors: {
        primary,
        neutral,
        ...semantic,
      },
      fontFamily: {
        sans: ['Pretendard', 'Pretendard Variable', 'system-ui', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      // Figma 최종 폰트 시스템(Pretendard). 볼드 2종(head-1, body-3) 추가 + 자간 조정.
      fontSize: {
        // Head — 140% line-height
        'head-1': ['20px', { lineHeight: '1.4em', letterSpacing: '-0.015em', fontWeight: '700' }], // Head1_b_20
        'head-2': ['20px', { lineHeight: '1.4em', letterSpacing: '-0.015em', fontWeight: '600' }], // Head2_sb_20
        'head-3': ['16px', { lineHeight: '1.5em', letterSpacing: '-0.01em', fontWeight: '600' }], // Head3_sb_16
        // Body — 150%
        'body-1': ['16px', { lineHeight: '1.5em', fontWeight: '500' }], // Body1_m_16
        'body-2': ['16px', { lineHeight: '1.5em', fontWeight: '400' }], // Body2_r_16
        'body-3': ['14px', { lineHeight: '1.5em', letterSpacing: '-0.005em', fontWeight: '700' }], // Body3_b_14
        'body-4': ['14px', { lineHeight: '1.5em', letterSpacing: '-0.005em', fontWeight: '600' }], // Body4_sb_14
        'body-5': ['14px', { lineHeight: '1.5em', fontWeight: '500' }], // Body5_m_14
        'body-6': ['14px', { lineHeight: '1.5em', fontWeight: '400' }], // Body6_r_14
        // Caption — 150%
        'caption-1': ['12px', { lineHeight: '1.5em', fontWeight: '500' }], // Caption1_m_12
        'caption-2': ['12px', { lineHeight: '1.5em', fontWeight: '400' }], // Caption2_r_12
        'caption-3': ['11px', { lineHeight: '1.5em', fontWeight: '400' }], // Caption3_r_11
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      boxShadow: {
        elevation: '0px 4px 20px 0px rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
