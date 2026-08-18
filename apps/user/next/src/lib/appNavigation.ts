export const DEARBLOOM_INTERNAL_ENTRY = '__dearbloomInternalEntry';

type HistoryEntryState = { [DEARBLOOM_INTERNAL_ENTRY]?: unknown } | null;

type AppRouter = {
  back: () => void;
  push: (href: string) => void;
  replace: (href: string) => void;
};

export const isDearbloomInternalEntry = (state: HistoryEntryState) =>
  state?.[DEARBLOOM_INTERNAL_ENTRY] === true;

export const getAppBackAction = (state: HistoryEntryState) =>
  isDearbloomInternalEntry(state) ? 'back' : 'fallback';

export const isNextAppHref = (href: string) => href === '/app' || href.startsWith('/app/');

export const toNextAppHref = (href: string) =>
  isNextAppHref(href) ? href.slice('/app'.length) || '/' : href;

export function pushApp(router: Pick<AppRouter, 'push'>, href: string) {
  router.push(toNextAppHref(href));
}

export function replaceApp(router: Pick<AppRouter, 'replace'>, href: string) {
  if (isNextAppHref(href)) {
    router.replace(toNextAppHref(href));
    return;
  }

  window.location.replace(href);
}

export function navigateAppBack(router: Pick<AppRouter, 'back' | 'replace'>, fallbackHref: string) {
  if (getAppBackAction(window.history.state) === 'back') {
    router.back();
    return;
  }

  replaceApp(router, fallbackHref);
}

export function createNavigationHistoryScript() {
  const marker = JSON.stringify(DEARBLOOM_INTERNAL_ENTRY);

  return `(() => {
  const marker = ${marker};
  const originalPushState = window.history.pushState.bind(window.history);
  const originalReplaceState = window.history.replaceState.bind(window.history);
  const isNextAppUrl = (url) => {
    try {
      const target = new URL(url ?? window.location.href, window.location.href);
      return target.origin === window.location.origin && (target.pathname === '/app' || target.pathname.startsWith('/app/'));
    } catch {
      return false;
    }
  };
  const withMarker = (state) => ({ ...(state && typeof state === 'object' ? state : {}), [marker]: true });
  const notifyNative = () => {
    window.ReactNativeWebView?.postMessage(JSON.stringify({
      type: 'NATIVE_NAVIGATION_STATE',
      hasInternalBack: window.history.state?.[marker] === true,
    }));
  };

  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation?.type === 'reload' && window.history.state?.[marker] === true) {
    const { [marker]: _marker, ...state } = window.history.state;
    originalReplaceState(state, '', window.location.href);
  }

  window.history.pushState = (state, title, url) => {
    const result = originalPushState(isNextAppUrl(url) ? withMarker(state) : state, title, url);
    notifyNative();
    return result;
  };
  window.history.replaceState = (state, title, url) => {
    const shouldKeepMarker = isNextAppUrl(url) && window.history.state?.[marker] === true;
    const result = originalReplaceState(shouldKeepMarker ? withMarker(state) : state, title, url);
    notifyNative();
    return result;
  };

  window.addEventListener('popstate', notifyNative);
  window.addEventListener('pageshow', notifyNative);
  notifyNative();
})();`;
}
