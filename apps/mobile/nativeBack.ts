export type AndroidBackAction = 'confirm-exit' | 'go-back';
export const NATIVE_NAVIGATION_STATE = 'NATIVE_NAVIGATION_STATE';

export function getAndroidBackAction(
  hasAppNavigationBack: boolean,
  hasWebViewBack: boolean,
): AndroidBackAction {
  return hasAppNavigationBack || hasWebViewBack ? 'go-back' : 'confirm-exit';
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
