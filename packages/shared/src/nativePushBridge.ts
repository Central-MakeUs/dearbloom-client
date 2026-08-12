/**
 * 앱(WebView) ↔ 네이티브 셸 푸시 브릿지 프로토콜.
 *
 * 소셜 로그인(`NATIVE_SOCIAL_LOGIN_RESULT`)과 같은 방식이다 —
 * 웹 → 네이티브는 `ReactNativeWebView.postMessage`, 네이티브 → 웹은 `CustomEvent` 디스패치.
 *
 * 권한 요청 시점을 **웹이 정한다.** 앱 첫 실행에 맥락 없이 OS 팝업을 띄우면 심사에서 지적받고,
 * iOS 는 한 번 거부하면 앱에서 다시 띄울 수 없다. 그래서 웹이 로그인·안내를 끝낸 뒤 요청을 보낸다.
 */

/** 웹 → 네이티브: 권한 요청(필요 시) 후 FCM 토큰을 달라. */
export const NATIVE_PUSH_REGISTER = 'NATIVE_PUSH_REGISTER';

/** 네이티브 → 웹: 토큰 요청 결과. */
export const NATIVE_PUSH_TOKEN_RESULT = 'NATIVE_PUSH_TOKEN_RESULT';

export type NativePushPlatform = 'ANDROID' | 'IOS';

export type NativePushTokenResult = {
  message?: string;
  platform?: NativePushPlatform;
  /** granted 일 때만 채워진다. */
  token?: string;
  /**
   * - `granted` 토큰 획득
   * - `denied` 사용자가 OS 권한을 거부 (재요청 불가)
   * - `unsupported` 이 플랫폼에서는 푸시를 쓰지 않음 (현재 Android)
   * - `error` 토큰 획득 실패
   */
  status: 'denied' | 'error' | 'granted' | 'unsupported';
  type: typeof NATIVE_PUSH_TOKEN_RESULT;
};
