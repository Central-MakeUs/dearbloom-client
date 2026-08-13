import Link from 'next/link';
import type { AnchorHTMLAttributes } from 'react';

/**
 * 앱 내부 링크 — 목적지가 이 Next 앱이면 클라이언트 라우팅, 아니면 문서 이동.
 *
 * 한 도메인에 Next(`/app/*`)와 Astro(그 외)가 같이 얹혀 있어서, 링크마다 어느 쪽으로
 * 가는지가 다릅니다. `<a>` 로 통일해두면 Next→Next 이동까지 문서를 새로 받게 되고
 * (번들 재실행 + 상태 초기화), `<Link>` 로 통일하면 Astro 라우트가 깨집니다.
 *
 * 그래서 `/app` 접두사로 갈라줍니다. 호출부는 실제 브라우저 경로(`/app/...`)를 그대로
 * 넘기면 됩니다 — `<Link>` 는 basePath 를 자동으로 붙이므로 여기서 접두사를 떼어냅니다.
 * (호출부에서 직접 `<Link href="/app/...">` 를 쓰면 `/app/app/...` 이 됩니다.)
 */
export function AppLink({ href, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  // 라우트 핸들러(`/app/api/*`)는 페이지가 아니라 서버 응답이라 문서 이동이어야 합니다.
  const isNextPage = (href === '/app' || href.startsWith('/app/')) && !href.startsWith('/app/api/');
  if (!isNextPage) return <a href={href} {...rest} />;

  return <Link href={href.slice('/app'.length) || '/'} {...rest} />;
}
