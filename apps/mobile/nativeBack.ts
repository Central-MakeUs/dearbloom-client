export type AndroidBackAction = 'confirm-exit' | 'go-back';
export const NATIVE_EXIT_CONFIRM = 'NATIVE_EXIT_CONFIRM';
export const NATIVE_EXIT_REQUEST = 'NATIVE_EXIT_REQUEST';

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
