# AGENTS.md

이 프로젝트에서 작업하는 AI 에이전트(코드 어시스턴트)를 위한 안내입니다.
(파일명은 여러 AI 코딩 도구가 자동 인식하는 표준 `AGENTS.md` 를 따릅니다)

## 규칙과 컨벤션은 README.md를 따르세요

프로젝트 구조, 스택, 컴포넌트/API/JSX 컨벤션은 모두 **[README.md](./README.md)** 에 정리되어 있습니다.
코드를 작성하거나 수정하기 전에 반드시 README.md의 **Conventions** 섹션을 확인하세요.

특히 다음 항목을 준수해야 합니다:

- **Component Convention** — 공통 컴포넌트 우선, 페이지 코로케이션, shadcn 래퍼 규칙
- **API Pattern (queryOptions)** — `_fetch.ts` 작성 순서 (Types → HTTP calls → queryOptions → Mutation hooks)
- **JSX Style** — JSX 조각을 이름 있는 변수로 분리 후 `return`에서 조립
- **No Hex Colors** — 헥사코드 직접 사용 금지. `packages/config/tailwind.preset.mjs` 의 토큰(예: `text-brand`, `bg-danger`)만 사용

## Git 작업 규칙

- 브랜치명에 `codex/`를 사용하지 않습니다.
- 기능·출시 준비 작업은 `feature/<kebab-case>` 형식을 사용합니다.
- 커밋 메시지는 `type(scope): 한글 요약` 형식을 사용합니다. 예: `fix(user): 앱 WebView 하단 여백 중복 제거`
- 별도 요청이 없으면 PR 대상 브랜치는 `develop`입니다.
