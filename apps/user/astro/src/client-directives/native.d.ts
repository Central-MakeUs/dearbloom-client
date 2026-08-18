declare module 'astro' {
  interface AstroClientDirectives {
    /** RN WebView 안에서만 하이드레이트. 브라우저에는 아일랜드 JS 를 내려보내지 않는다. */
    'client:native'?: boolean;
  }
}

declare global {
  interface Window {
    /** RN WebView 가 컨텐츠 로드 전에 주입하는 플래그 (apps/mobile/App.tsx). */
    __DEARBLOOM_NATIVE_APP__?: {
      platform?: string;
      supportsKakaoAvailability?: boolean;
    };
  }
}

export {};
