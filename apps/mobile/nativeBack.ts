export type AndroidBackAction = 'confirm-exit' | 'go-back';
export const NATIVE_EXIT_CONFIRM = 'NATIVE_EXIT_CONFIRM';
export const NATIVE_EXIT_REQUEST = 'NATIVE_EXIT_REQUEST';
export const NATIVE_NAVIGATION_STATE = 'NATIVE_NAVIGATION_STATE';

export function getAndroidBackAction(canGoBack: boolean): AndroidBackAction {
  return canGoBack ? 'go-back' : 'confirm-exit';
}

export function createNativeExitRequestScript() {
  return `window.dispatchEvent(new Event('${NATIVE_EXIT_REQUEST}')); true;`;
}

export function isNativeExitConfirm(message: string) {
  if (message === NATIVE_EXIT_CONFIRM) return true;

  try {
    return (JSON.parse(message) as { type?: unknown }).type === NATIVE_EXIT_CONFIRM;
  } catch {
    return false;
  }
}

export function parseNativeNavigationState(message: string) {
  try {
    const value = JSON.parse(message) as { hasInternalBack?: unknown; type?: unknown };
    return value.type === NATIVE_NAVIGATION_STATE && typeof value.hasInternalBack === 'boolean'
      ? value.hasInternalBack
      : undefined;
  } catch {
    return undefined;
  }
}
