/**
 * dearBloom 공통 Tailwind 프리셋 (Figma 디자인 시스템 반영)
 *
 * 헥사코드 직접 사용 금지 — 이 파일 안에서만 정의하고, 코드에서는 토큰 클래스(예: text-primary, bg-neutral-100)를 사용하세요.
 */

/* eslint-disable no-restricted-syntax -- 디자인 토큰 정의는 이 파일에서만 허용 */

const primary = {
  50: '#F4F7F5',
  100: '#E6EDE8',
  200: '#CBD9D0',
  300: '#AFC4B7',
  400: '#7F9F8C',
  500: '#296A48', // Primary (DEFAULT) — Figma 브랜드 그린(primary/primary)
  600: '#2D533F',
  700: '#264636',
  800: '#1E382B',
  900: '#15281F',
  DEFAULT: '#296A48',
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
      fontSize: {
        // Head — 굵고 큰 제목
        'head-1': ['20px', { lineHeight: '1.4em', letterSpacing: '-0.015em', fontWeight: '600' }],
        'head-2': ['16px', { lineHeight: '1.5em', letterSpacing: '-0.01em', fontWeight: '600' }],
        // Body
        'body-1': ['16px', { lineHeight: '1.5em', fontWeight: '500' }],
        'body-2': ['16px', { lineHeight: '1.5em', fontWeight: '400' }],
        'body-3': ['14px', { lineHeight: '1.5em', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-4': ['14px', { lineHeight: '1.5em', fontWeight: '500' }],
        'body-5': ['14px', { lineHeight: '1.5em', fontWeight: '400' }],
        // Caption
        'caption-1': ['12px', { lineHeight: '1.5em', fontWeight: '500' }],
        'caption-2': ['12px', { lineHeight: '1.5em', fontWeight: '400' }],
        'caption-3': ['11px', { lineHeight: '1.5em', fontWeight: '400' }],
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
