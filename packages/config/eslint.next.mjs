import base from './eslint.config.mjs';

/**
 * Next.js 앱용 ESLint 프리셋.
 * Next 공식 룰은 각 앱의 next 패키지가 제공하는 config를 별도로 확장하세요 (next lint 자동 처리).
 * 여기선 공통 base + Next 전용 오버라이드만 얹습니다.
 */
export default [
  ...base,
  {
    rules: {
      // 서버 컴포넌트/클라이언트 컴포넌트 혼용 시 필요한 오버라이드가 있다면 여기에
    },
  },
];
