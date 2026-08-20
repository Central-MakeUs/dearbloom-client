export const NATIVE_PUSH_REGISTER = 'NATIVE_PUSH_REGISTER';
export const NATIVE_PUSH_TOKEN_RESULT = 'NATIVE_PUSH_TOKEN_RESULT';

export type NativePushPlatform = 'ANDROID' | 'IOS';

/**
 * Android 알림 채널 ID·이름.
 *
 * Android 8+ 는 채널이 있어야 알림을 표시하고, 사용자 알림 설정에도 채널 단위로 노출된다.
 * 서버가 보내는 `android.notification.channel_id` 와 <b>반드시 같아야 한다</b> —
 * 어긋나면 알림이 에러 없이 누락되고 발송 로그는 SUCCESS 로 남아 원인을 찾기 어렵다.
 */
export const ANDROID_CHANNEL_ID = 'dearbloom-default';
export const ANDROID_CHANNEL_NAME = '디어블룸 알림';

export interface NativePushTokenResult {
  type: typeof NATIVE_PUSH_TOKEN_RESULT;
  status: 'denied' | 'error' | 'granted' | 'unsupported';
  platform?: NativePushPlatform;
  token?: string;
  message?: string;
}

/** 웹이 보낸 "권한 요청 후 FCM 토큰을 달라" 메시지인지 판별한다. */
export function isNativePushRegisterRequest(message: string) {
  if (message === NATIVE_PUSH_REGISTER) return true;

  try {
    return (JSON.parse(message) as { type?: unknown }).type === NATIVE_PUSH_REGISTER;
  } catch {
    return false;
  }
}

/** 토큰 결과를 WebView 에 CustomEvent 로 전달할 주입 스크립트. 소셜 로그인 결과와 같은 방식. */
export function createPushTokenResultScript(result: NativePushTokenResult) {
  const serialized = JSON.stringify(result).replace(/</g, '\\u003c');

  return `window.dispatchEvent(new CustomEvent('${NATIVE_PUSH_TOKEN_RESULT}', { detail: ${serialized} })); true;`;
}

export interface PushBannerContent {
  title: string;
  body: string;
  deepLink?: string;
}

/**
 * 포그라운드로 도착한 알림에서 인앱 배너에 띄울 내용을 뽑는다. <b>Android 전용</b>이다.
 *
 * iOS 는 `firebase.json` 의 `messaging_ios_foreground_presentation_options` 로 시스템이 직접
 * 표시하지만, Android 에는 대응 옵션이 없어 앱이 떠 있는 동안 온 알림이 그냥 사라진다.
 * 작가가 작업 중일 때가 오히려 새 문의를 놓치면 안 되는 상황이라 셸이 직접 배너를 그린다.
 *
 * title 이 없으면(데이터 전용 메시지 등) 띄우지 않는다.
 */
export function getPushBannerContent(message: unknown): PushBannerContent | undefined {
  if (!message || typeof message !== 'object') return undefined;

  const { data, notification } = message as { data?: unknown; notification?: unknown };
  if (!notification || typeof notification !== 'object') return undefined;

  const { body, title } = notification as { body?: unknown; title?: unknown };
  if (typeof title !== 'string' || !title) return undefined;

  const deepLink = (data as Record<string, unknown> | undefined)?.deepLink;

  return {
    body: typeof body === 'string' ? body : '',
    deepLink: typeof deepLink === 'string' ? deepLink : undefined,
    title,
  };
}

/**
 * 알림 페이로드의 딥링크로 WebView 가 열 URL 을 만든다.
 *
 * 서버는 `data.deepLink` 에 `/app/artist/requests/123` 같은 **내부 절대경로**만 넣는다.
 * 외부 URL 이나 프로토콜 상대경로(`//evil.example`)가 들어오면 열지 않는다 — 알림 페이로드를
 * 신뢰해 임의 주소를 여는 통로가 되면 안 되기 때문이다.
 */
export function getPushDeepLinkWebViewUrl(deepLink: unknown, webViewUrl: string) {
  if (typeof deepLink !== 'string' || !deepLink.startsWith('/') || deepLink.startsWith('//')) {
    return undefined;
  }
  if (/[\n\r\t\\]/.test(deepLink)) return undefined;

  try {
    const target = new URL(webViewUrl);
    const path = new URL(deepLink, target.origin);
    if (path.origin !== target.origin) return undefined;

    return path.toString();
  } catch {
    return undefined;
  }
}
