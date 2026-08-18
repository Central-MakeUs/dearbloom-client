import { loginHref } from './env';

/**
 * 동작 중 401 을 만났을 때 로그인 화면으로 보낸다.
 *
 * push(location.href)로 얹는 이유 — 로그인 화면의 닫기(X)는 뒤로가기라서, 지금 보던 화면이
 * 히스토리에 남아 있어야 닫았을 때 제자리로 돌아온다. 로그인 엔트리 자체는
 * SocialLoginButtons 가 replace 로 이동하며 사라지므로 히스토리에 쌓이지 않는다.
 *
 * @param returnUrl 로그인 후 돌아올 경로(브라우저 기준). 생략하면 현재 주소.
 */
export function goLogin(returnUrl?: string) {
  const destination = returnUrl ?? window.location.pathname + window.location.search;
  window.location.href = loginHref(destination);
}
