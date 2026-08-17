/**
 * 개발용 로그인 활성화 여부 (클라이언트에서도 안전하게 읽을 수 있는 public 플래그).
 * 기본값은 enabled — 로컬/개발 서버에서 dev 로그인이 계속 동작하도록 한다.
 * 프로덕션에서는 NEXT_PUBLIC_ENABLE_DEV_LOGIN=false 로 비활성화한다.
 */
export const DEV_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== 'false';

/**
 * 로그인이 필요할 때 이동할 경로. **항상 실제(소셜) 로그인 페이지**로 보낸다.
 * NEXT_PUBLIC_* 값은 클라이언트 번들에 빌드타임 인라인되므로, 여기서 dev 로그인 경로를
 * 분기하면 빌드/런타임 시점이 어긋날 때 프로덕션에서도 dev 로그인으로 새어나갈 수 있다.
 * 그래서 진입점은 하나로 고정하고, dev 로그인은 로그인 페이지 안에서 dev 환경일 때만 노출한다.
 * 앱은 basePath `/app` 하위로 서빙되므로 경로에 `/app` 접두어를 포함한다.
 */
export const LOGIN_HREF = '/app/login';

/**
 * 로그인 페이지 주소 + 복귀 경로(returnUrl).
 * returnUrl 은 **브라우저 기준 경로**라 next 앱 안이면 '/app' 접두어를 포함해야 한다
 * (예: '/app/chats'). 넘기지 않으면 로그인 후 역할 홈으로 간다.
 */
export function loginHref(returnUrl?: string) {
  return returnUrl ? `${LOGIN_HREF}?returnUrl=${encodeURIComponent(returnUrl)}` : LOGIN_HREF;
}

