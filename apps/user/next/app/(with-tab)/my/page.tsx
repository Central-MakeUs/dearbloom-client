const menu = [
  { label: '예약·문의 내역', href: '/app/my/reservations' },
  { label: '기본 정보 설정', href: '/app/onboarding/basic' },
  { label: '내가 작성한 후기', href: '#' },
  { label: '내가 작성한 Q&A', href: '#' },
  { label: '공지사항', href: '#' },
  { label: '문의하기', href: '#' },
  { label: '알림 설정', href: '#' },
];

export default function MyPage() {
  const profile = (
    <header className="px-4 pt-6">
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 rounded-full bg-gradient-to-br from-primary-200 to-primary-400" />
        <div className="flex-1">
          <div className="text-head-2 text-neutral-950">봄봄이</div>
          <div className="text-caption-1 text-neutral-600">홍익대학교 · 예산 10~15만원</div>
        </div>
        <a
          href="/app/onboarding/basic"
          className="whitespace-nowrap rounded-full border border-neutral-300 px-3 py-1.5 text-caption-1 text-neutral-700"
        >
          프로필 편집
        </a>
      </div>
    </header>
  );

  const menuList = (
    <nav className="mt-6 border-t border-neutral-200 bg-neutral-0">
      {menu.map((m) => (
        <a
          key={m.label}
          href={m.href}
          className="flex items-center gap-3 border-b border-neutral-200 px-4 py-4 transition-colors hover:bg-neutral-100"
        >
          <span className="flex-1 text-body-3 text-neutral-900">{m.label}</span>
          <span aria-hidden className="text-neutral-400">
            ›
          </span>
        </a>
      ))}
    </nav>
  );

  const footer = (
    <div className="px-4 py-6">
      <button type="button" className="text-body-5 text-neutral-500 underline underline-offset-2">
        로그아웃
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      {profile}
      {menuList}
      {footer}
    </div>
  );
}
