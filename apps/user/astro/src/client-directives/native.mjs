/* global window */

/**
 * `client:native` — RN WebView 안에서만 하이드레이트하는 커스텀 client 디렉티브.
 *
 * 네이티브에서만 의미 있는 아일랜드(앱 종료 확인 모달 등)를 `client:load` 로 두면,
 * 웹 방문자도 React + 아일랜드 청크를 전부 받는다(정적 페이지 기준 132KB gzip).
 * 이 디렉티브는 네이티브 플래그가 없으면 `load()` 를 호출하지 않으므로 브라우저는
 * 컴포넌트 JS 를 한 바이트도 내려받지 않는다.
 *
 * 플래그는 `apps/mobile/App.tsx` 가 `injectedJavaScriptBeforeContentLoaded` 로 주입하므로
 * 페이지 스크립트보다 항상 먼저 존재한다 — 별도 대기가 필요 없다.
 *
 * @type {import('astro').ClientDirective}
 */
export default (load) => {
  if (!window.__DEARBLOOM_NATIVE_APP__?.platform) return;

  void (async () => {
    const hydrate = await load();
    await hydrate();
  })();
};
