export const NATIVE_SAFE_AREA_COLORS = 'NATIVE_SAFE_AREA_COLORS';

export type NativeSafeAreaColors = {
  bottom: string;
  top: string;
};

export const defaultNativeSafeAreaColors: NativeSafeAreaColors = {
  bottom: 'rgb(248, 248, 248)',
  top: 'rgb(248, 248, 248)',
};

const nativeColorPattern =
  /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(?:0|1|0?\.\d+))?\s*\)$/;

function isNativeColor(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const match = value.match(nativeColorPattern);
  if (!match) return false;

  return match.slice(1, 4).every((channel) => Number(channel) <= 255);
}

export function parseNativeSafeAreaColors(message: string): NativeSafeAreaColors | undefined {
  try {
    const parsedMessage = JSON.parse(message) as {
      bottom?: unknown;
      top?: unknown;
      type?: unknown;
    };

    return parsedMessage.type === NATIVE_SAFE_AREA_COLORS &&
      isNativeColor(parsedMessage.top) &&
      isNativeColor(parsedMessage.bottom)
      ? { bottom: parsedMessage.bottom, top: parsedMessage.top }
      : undefined;
  } catch {
    return undefined;
  }
}

export const nativeSafeAreaSyncScript = `
(() => {
  if (window.__DEARBLOOM_SAFE_AREA_SYNC__) return;
  window.__DEARBLOOM_SAFE_AREA_SYNC__ = true;

  const fallbackColor = '${defaultNativeSafeAreaColors.top}';
  let lastMessage = '';
  let scheduled = false;

  const findBackgroundColor = (element) => {
    let current = element;

    while (current) {
      const color = window.getComputedStyle(current).backgroundColor;

      if (color && color !== 'transparent' && color !== 'rgba(0, 0, 0, 0)') {
        return color;
      }

      current = current.parentElement;
    }

    return fallbackColor;
  };

  const sendColors = () => {
    scheduled = false;

    const x = Math.max(0, Math.floor(window.innerWidth / 2));
    const bottomY = Math.max(0, window.innerHeight - 1);
    const message = JSON.stringify({
      bottom: findBackgroundColor(document.elementFromPoint(x, bottomY)),
      top: findBackgroundColor(document.elementFromPoint(x, 1)),
      type: '${NATIVE_SAFE_AREA_COLORS}',
    });

    if (message === lastMessage) return;

    lastMessage = message;
    window.ReactNativeWebView?.postMessage(message);
  };

  const scheduleSync = () => {
    if (scheduled) return;

    scheduled = true;
    window.requestAnimationFrame(sendColors);
  };

  new MutationObserver(scheduleSync).observe(document.documentElement, {
    attributeFilter: ['class', 'style'],
    attributes: true,
    childList: true,
    subtree: true,
  });
  window.addEventListener('pageshow', scheduleSync);
  window.addEventListener('resize', scheduleSync);
  scheduleSync();
})();
true;
`;
