# dearBloom

DearDay 리브랜드 — 모노레포.

## 구조

```
apps/
├── user/
│   ├── astro/      # 비로그인 SEO 페이지 (Astro)
│   └── next/       # 로그인 후 Customer + Artist 모드 (Next 16)
├── admin/          # 운영자 (Next 16)
└── mobile/         # RN WebView 컨테이너 (Expo)

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
- Expo / React Native / react-native-webview (모바일 컨테이너)
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
pnpm mobile
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

색상은 **디자인 토큰**만 사용합니다. 코드에 `#345F48` 같은 hex를 쓰면 ESLint가 경고합니다.

- 토큰 정의: `packages/config/tailwind.preset.mjs` (Figma 디자인 시스템 반영)
- 사용: `text-primary`, `bg-neutral-100`, `border-neutral-200`, `text-success`, `text-danger`
- 예외적으로 필요할 때만: `// eslint-disable-next-line no-restricted-syntax`

### 디자인 시스템 — Figma 토큰

Tailwind 프리셋(`packages/config/tailwind.preset.mjs`)에서 정의된 토큰만 사용합니다.

- **색상**
  - `primary.50` ~ `primary.900` (Primary 그린 스케일, DEFAULT = `#345F48`)
  - `neutral.0` (white) ~ `neutral.950`
  - `error`, `danger`, `success`
- **타이포그래피** — `text-head-1`, `text-head-2`, `text-body-1` ~ `text-body-5`, `text-caption-1` ~ `text-caption-3`
- **radius** — `rounded-sm` (4px), `rounded-md` (8px), `rounded-lg` (12px), `rounded-xl` (16px)
- **shadow** — `shadow-elevation`
- **폰트** — `font-sans` = Pretendard

### cn 유틸리티 — 조건부 클래스

Tailwind 클래스를 조건부로 합칠 땐 항상 `cn` 사용 (clsx + tailwind-merge).

```tsx
import { cn } from '@dearbloom/ui';

<button
  className={cn(
    'rounded-md text-body-3 px-4 py-2',
    variant === 'primary' && 'bg-primary text-neutral-0',
    variant === 'ghost' && 'bg-neutral-100 text-neutral-900',
    disabled && 'opacity-40 pointer-events-none',
    className,
  )}
/>
```

`tailwind-merge` 가 `px-2 px-4` 같은 충돌을 알아서 뒤엣값으로 정리해줘요.

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
