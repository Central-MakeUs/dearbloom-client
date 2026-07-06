# dearBloom

DearDay 리브랜드 — 모노레포.

## 구조

```
apps/
├── user/
│   ├── astro/      # 비로그인 SEO 페이지 (Astro)
│   └── next/       # 로그인 후 Customer + Artist 모드 (Next 16)
└── admin/          # 운영자 (Next 16)

packages/
├── ui/             # 공통 React 컴포넌트
├── mobile/         # 모바일 전용 패턴
├── shared/         # 타입/유틸/axios
├── config/         # 공통 tsconfig/tailwind/eslint
└── features/
    ├── account/    # 마이페이지 공통 섹션
    ├── auth/       # 로그인/세션
    └── chat/       # 채팅
```

## 스택

- Node 20+
- pnpm 9 + Turborepo 2
- Next.js 16 (Customer 앱, Artist 앱, Admin 앱)
- Astro (SEO 페이지)
- TypeScript / Tailwind / shadcn(Radix)
- 상태: Zustand (전역·persist) + Context (범위)
- 서버 상태: TanStack Query
- HTTP: axios
- 폼: React Hook Form + Zod

## 실행

```bash
pnpm install
pnpm dev            # 전체 앱 동시 실행 (Turborepo 병렬)
pnpm --filter user-astro dev
pnpm --filter user-next dev
pnpm --filter admin dev
```

### 개발 포트

| 앱 | 포트 | URL |
|---|---|---|
| `user-astro` | **4321** | http://localhost:4321 |
| `user-next` | **3000** | http://localhost:3000 |
| `admin` | **3001** | http://localhost:3001 |

## 배포 & 도메인

### 컨셉 — 한 도메인, 세 앱

Customer/Artist는 사용자에게 **`dearbloom.co.kr`** 한 도메인으로만 보입니다.
Astro가 게이트웨이 역할을 하고, `/app/*` 요청은 Vercel Rewrites 로 Next 앱에 프록시합니다.

```
dearbloom.co.kr             → Astro (SEO 페이지, 랜딩/스냅/작가 등)
dearbloom.co.kr/app/*       → Next (Customer + Artist, 로그인 후 앱)  ─ rewrites 프록시
admin.dearbloom.co.kr       → Next (Admin, 운영자 전용 — 완전 별도)
```

로그인 쿠키는 `dearbloom.co.kr` 도메인으로 발급하면 Astro/Next 사이에서 자연스럽게 공유됩니다.

### Vercel 프로젝트

앱별로 **각각 별도 프로젝트**로 배포합니다. Astro와 Next를 한 프로젝트에 섞지 않아요.

| 앱 | Vercel 프로젝트 | Framework | Root Directory | 노출 URL | 실 배포 URL |
|---|---|---|---|---|---|
| `user-astro` | `dearbloom-astro` | Astro | `apps/user/astro` | **dearbloom.co.kr** | `dearbloom-astro.vercel.app` |
| `user-next` | `dearbloom-next` | Next.js | `apps/user/next` | **dearbloom.co.kr/app/\*** | `dearbloom-next.vercel.app` |
| `admin` | `dearbloom-admin` | Next.js | `apps/admin` | **admin.dearbloom.co.kr** | `dearbloom-admin.vercel.app` |

### 핵심 설정

1. **`apps/user/next/next.config.mjs`** — `basePath: '/app'`
   - `_next/static` 등 정적 자산 경로가 자동으로 `/app/_next/static` 이 됨 → 프록시 뒤에서도 안 깨짐
2. **`apps/user/astro/vercel.json`** — `/app/*` 를 `dearbloom-next.vercel.app/app/*` 로 rewrite
3. **커스텀 도메인 연결**은 `dearbloom-astro` 와 `dearbloom-admin` 프로젝트만
   - `dearbloom-next` 는 Vercel 기본 URL만 두고 외부 노출 X

### Vercel 프로젝트 설정 (공통)

각 프로젝트를 Vercel Dashboard에서 Import 할 때:

- **Root Directory** — 위 표의 `Root Directory` 지정 (예: `apps/user/next`)
- **Framework Preset** — 자동 감지 (Astro / Next.js)
- **Package Manager** — pnpm (자동 감지)
- **Install Command** — 기본값 유지 (`pnpm install`)
- **Build Command** — 기본값 유지 (각 앱의 `pnpm build`)
- **Output Directory** — 기본값 유지 (`.next` or `dist`)
- **Ignored Build Step** (변경 없을 때 빌드 스킵):
  ```bash
  npx turbo-ignore <앱이름>
  # 예: npx turbo-ignore user-next
  ```

### 도메인 연결

Vercel Dashboard → 각 프로젝트 → **Settings → Domains** 에서:

- `dearbloom-astro` 프로젝트에 → `dearbloom.co.kr`, `www.dearbloom.co.kr`
- `dearbloom-admin` 프로젝트에 → `admin.dearbloom.co.kr`
- `dearbloom-next` 프로젝트에는 **도메인 붙이지 않음** (rewrites 대상으로만 사용)

DNS (Route53, IAM 계정으로 접근):

- `dearbloom.co.kr` — A 레코드 → Vercel (`76.76.21.21`)
- `www.dearbloom.co.kr` — CNAME → `cname.vercel-dns.com`
- `admin.dearbloom.co.kr` — CNAME → `cname.vercel-dns.com`

### 헤더/푸터 등 공통 UI

`dearbloom.co.kr` 과 `dearbloom.co.kr/app/*` 이 서로 다른 앱이라 라우팅 전환 시 페이지 리로드가 발생합니다.
사용자가 이질감을 느끼지 않도록 헤더/푸터/폰트/컬러 토큰은 **`packages/ui`** 에서 공유합니다.

### 환경변수

각 Vercel 프로젝트의 **Settings → Environment Variables** 에서 관리 (`.env.example` 참고).

- **Production** 환경 = `main` 브랜치
- **Preview** 환경 = `develop` 브랜치 및 기타 feature 브랜치
- **Development** = 로컬 `pnpm dev`

`NEXT_PUBLIC_API_URL` 처럼 환경별로 다른 값은 Production/Preview 를 다르게 채워두세요.

---

## 개발 서버 배포 (develop 브랜치)

### 도메인 매핑

| 환경 | 브랜치 | 노출 도메인 | 실 배포 URL |
|---|---|---|---|
| Production | `main` | `dearbloom.co.kr` | `dearbloom-astro.vercel.app` |
| Production | `main` | `dearbloom.co.kr/app/*` | `dearbloom-next.vercel.app` |
| Production | `main` | `admin.dearbloom.co.kr` | `dearbloom-admin.vercel.app` |
| **Dev** | `develop` | **`dev.dearbloom.co.kr`** | `dearbloom-astro-git-develop-*.vercel.app` |
| **Dev** | `develop` | **`dev.dearbloom.co.kr/app/*`** | `dearbloom-next-git-develop-*.vercel.app` |
| **Dev** | `develop` | **`dev-admin.dearbloom.co.kr`** | `dearbloom-admin-git-develop-*.vercel.app` |

### 브랜치별 vercel.json 분리

`apps/user/astro/vercel.json` 은 **브랜치마다 destination 이 다릅니다**.
동일 소스에 조건부 rewrites 를 넣는 대신, `main` 과 `develop` 브랜치에 각각 하나의 destination 만 두는 방식을 사용합니다:

- `main` 브랜치 → `dearbloom-next.vercel.app` (Production Next)
- `develop` 브랜치 → `dearbloom-next-git-develop-<team>.vercel.app` (Preview Next)

`develop` 브랜치의 실제 vercel Preview URL 이 확정되면 (`dearbloom-next` 프로젝트에서 develop 브랜치 첫 배포 후 확인 가능), `develop` 브랜치의 vercel.json 을 그 값으로 갱신해야 합니다.

### DNS 레코드 추가 (Route53)

기존 3개 레코드에 다음 2개 추가:

| 이름 | 유형 | 값 | TTL |
|---|---|---|---|
| `dev` | CNAME | `cname.vercel-dns.com` | 300 |
| `dev-admin` | CNAME | `cname.vercel-dns.com` | 300 |

### Vercel Dashboard 세팅

각 프로젝트 → **Settings → Domains → Add** 후 도메인의 **Git Branch** 를 `develop` 로 지정.

- `dearbloom-astro` → **Add `dev.dearbloom.co.kr`** → Git Branch: `develop`
- `dearbloom-admin` → **Add `dev-admin.dearbloom.co.kr`** → Git Branch: `develop`
- `dearbloom-next` → 도메인 add 안 함 (rewrites 대상). 다만 `develop` 브랜치가 Preview Deployment 로 배포되도록 그대로 두기.

### 개발 배포 흐름

```bash
# feature 브랜치에서 작업 후 develop 에 머지
git checkout develop
git merge feature/xxx
git push origin develop
# → Vercel 이 develop 프리뷰 자동 배포 → dev.dearbloom.co.kr 갱신
```

프로덕션 배포는 `develop` → `main` 머지 (PR 권장):

```bash
# develop 이 안정되면 main 으로
git checkout main
git merge develop
git push origin main
# → Vercel 이 프로덕션 자동 배포 → dearbloom.co.kr 갱신
```

---

## Conventions

### Component Convention

- **공통 컴포넌트 우선**: `src/components/common/`에 이미 같은 역할의 컴포넌트가 있으면 재사용
- **페이지 코로케이션**: 처음엔 무조건 페이지 폴더 안에 둔다. **두 페이지 이상에서 쓰면 그때 `common/`으로 승격**
- **shadcn**: `src/components/ui/`는 빌딩 블록. 페이지에서는 `common/` 래퍼를 import
  - 예: `ui/button.tsx`(shadcn 원본) → `common/Button.tsx`(우리 래퍼) → 페이지에서 `common/Button` 사용

### API Pattern (queryOptions)

`_fetch.ts`에 다음 순서로 작성:

1. **Types** — 도메인 타입, payload 타입
2. **HTTP calls** — `async function`, export 안 함
3. **queryOptions** — `queryKey` + `queryFn` 묶음, export
4. **Mutation hooks** — `useCreateXxx`, `useUpdateXxx`, export

```ts
// 사용 예
const { data } = useQuery(matchesQuery());
```

### No Hex Colors

색상은 **디자인 토큰**만 사용합니다. 코드에 `#7C5CFF` 같은 hex를 쓰면 ESLint가 경고합니다.

- 토큰 정의: `packages/config/tailwind.preset.mjs`
- 사용: `text-brand`, `bg-danger`, `border-line` 등 Tailwind 클래스
- 예외적으로 필요할 때만: `// eslint-disable-next-line no-restricted-syntax`

### JSX Style

컴포넌트 안에서 JSX 조각을 이름 있는 변수로 분리한 뒤 `return`에서 조립.

```tsx
export default function Page() {
  const header = <h1>제목</h1>;
  const content = <main>...</main>;
  const footer = <footer>...</footer>;

  return (
    <div>
      {header}
      {content}
      {footer}
    </div>
  );
}
```
