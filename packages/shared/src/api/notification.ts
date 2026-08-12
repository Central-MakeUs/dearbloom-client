import { apiDelete, apiPost, type RequestOptions } from './http';

/**
 * 푸시 알림 — 디바이스 토큰 등록/해제.
 *
 * 앱(WebView) 전용입니다. 웹 브라우저에서는 토큰 자체가 없어 호출할 일이 없습니다.
 * 현재 발송은 iOS 만 이뤄집니다 — 앱도 Android 에서는 토큰을 요청하지 않습니다.
 */

export type DevicePlatform = 'ANDROID' | 'IOS';

export interface RegisterDeviceTokenPayload {
  token: string;
  platform: DevicePlatform;
}

/** FCM 토큰 등록. 멱등합니다 — 같은 토큰을 다시 보내면 소유자만 현재 회원으로 옮겨집니다. */
export function registerDeviceToken(
  payload: RegisterDeviceTokenPayload,
  opts: RequestOptions,
): Promise<void> {
  return apiPost<void>('/api/notifications/device-tokens', payload, opts);
}

/** 이 기기에서만 수신 해제. 로그아웃 시 로그아웃 API 보다 먼저 호출합니다. */
export function unregisterDeviceToken(token: string, opts: RequestOptions): Promise<void> {
  return apiDelete<void>(
    `/api/notifications/device-tokens?token=${encodeURIComponent(token)}`,
    undefined,
    opts,
  );
}
