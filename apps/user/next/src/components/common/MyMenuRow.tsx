import { AppLink } from './AppLink';

/**
 * 마이페이지 메뉴 한 줄 — 라벨 + 우측 화살표.
 *
 * Figma 실측: 행 높이 44(= icons/44/arrow/right 터치영역), 라벨 Head3_sb_16 neutral-800,
 * 화살표 glyph 는 44 박스 가운데의 7x14 chevron(neutral-600, stroke 1.8).
 * `href` 를 주면 링크, 없으면 버튼(로그아웃처럼 모달을 여는 항목)으로 렌더합니다.
 */
export function MyMenuRow({
  label,
  href,
  onClick,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const rowClass = 'flex h-11 w-full items-center justify-between text-left transition-colors hover:opacity-70';

  const labelNode = <span className="text-head-3 text-neutral-800">{label}</span>;

  const arrow = (
    <span className="flex size-11 shrink-0 items-center justify-center text-neutral-600" aria-hidden>
      <svg viewBox="0 0 44 44" fill="none" className="size-full">
        <path
          d="M19 15L26 22L19 29"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  // 문의 내역·탈퇴는 이 앱 라우트고 개인정보 처리방침은 Astro 라, AppLink 가 갈라줍니다.
  if (href) {
    return (
      <AppLink href={href} className={rowClass}>
        {labelNode}
        {arrow}
      </AppLink>
    );
  }

  return (
    <button type="button" onClick={onClick} className={rowClass}>
      {labelNode}
      {arrow}
    </button>
  );
}
