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
 * 서버 컴포넌트의 `redirect()` 전용 로그인 경로.
 * next 의 `redirect()` 는 Location 을 만들 때 basePath(`/app`)를 자동으로 붙이므로
 * `LOGIN_HREF` 를 그대로 넘기면 `/app/app/login`(404)이 된다. 여기서는 basePath 를 뺀 경로를 쓴다.
 * `<a href>` 등 브라우저가 그대로 쓰는 값에는 `LOGIN_HREF` 를 쓸 것.
 */
export const LOGIN_REDIRECT_PATH = '/login';
