'use client';

import { useEffect } from 'react';

import {
  NATIVE_PUSH_REGISTER,
  NATIVE_PUSH_TOKEN_RESULT,
  type NativePushTokenResult,
} from '@dearbloom/shared';

/**
 * 앱에서 FCM 토큰을 받아 서버에 등록한다. 웹 브라우저에서는 아무것도 하지 않는다.
 *
 * <b>권한 요청 시점을 여기서 정한다.</b> 로그인한 사용자에게만 요청하므로, 앱 첫 실행에 맥락 없이
 * OS 팝업이 뜨는 상황(심사 지적 사유)이 생기지 않는다. iOS 는 한 번 거부하면 앱에서 다시 띄울 수 없어
 * 거부 시 조용히 물러난다 — 알림 없이도 문의 목록에서 다 확인할 수 있다(Guideline 4.5.4).
 *
 * 등록은 멱등이라 화면 진입마다 호출돼도 행이 늘지 않는다. 오히려 매번 보내야 토큰 갱신을 따라잡는다.
 */
export function PushTokenRegistrar({ isLoggedIn }: { isLoggedIn: boolean }) {
  useEffect(() => {
    if (!isLoggedIn) return;

    const bridge = window.ReactNativeWebView;
    if (!window.__DEARBLOOM_NATIVE_APP__?.platform || !bridge) return;

    const handleResult = async (event: Event) => {
      const result = (event as CustomEvent<NativePushTokenResult>).detail;
      if (!result || result.type !== NATIVE_PUSH_TOKEN_RESULT) return;
      if (result.status !== 'granted' || !result.token || !result.platform) return;

      try {
        await fetch('/app/api/notifications/device-token', {
          body: JSON.stringify({ platform: result.platform, token: result.token }),
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
        });
      } catch {
        // 등록 실패는 사용자에게 알리지 않는다 — 알림은 부가 기능이고, 다음 진입 때 다시 시도된다.
      }
    };

    window.addEventListener(NATIVE_PUSH_TOKEN_RESULT, handleResult);
    bridge.postMessage(JSON.stringify({ type: NATIVE_PUSH_REGISTER }));

    return () => window.removeEventListener(NATIVE_PUSH_TOKEN_RESULT, handleResult);
  }, [isLoggedIn]);

  return null;
}
