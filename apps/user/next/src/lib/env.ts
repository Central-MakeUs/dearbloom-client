/**
 * 개발용 로그인 활성화 여부 (클라이언트에서도 안전하게 읽을 수 있는 public 플래그).
 * 기본값은 enabled — 로컬/개발 서버에서 dev 로그인이 계속 동작하도록 한다.
 * 프로덕션에서는 NEXT_PUBLIC_ENABLE_DEV_LOGIN=false 로 비활성화한다.
 */
export const DEV_LOGIN_ENABLED = process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN !== 'false';

/**
 * 로그인이 필요할 때 이동할 경로.
 * dev 로그인이 켜져 있으면 개발용 로그인, 아니면 실제(소셜) 로그인으로 보낸다.
 * 앱은 basePath `/app` 하위로 서빙되므로 경로에 `/app` 접두어를 포함한다.
 */
export const LOGIN_HREF = DEV_LOGIN_ENABLED ? '/app/dev/login' : '/app/login';
