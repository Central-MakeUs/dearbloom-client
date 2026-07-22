const ChevronRight = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="text-neutral-400">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const items: { label: string; desc: string; href?: string }[] = [
  { label: '일정 관리', desc: '촬영 가능 일정 · 예약 불가 관리', href: '/app/artist/schedule' },
  { label: '작품 관리', desc: '작품 등록 · 수정 · 삭제', href: '/app/artist/products' },
  { label: '작가 프로필', desc: '소개 · 활동 지역 · 촬영 정보', href: '/app/artist/profile' },
  { label: '신청 현황', desc: '준비중' },
  { label: '포인트 현황', desc: '준비중' },
];

export default function ArtistDashboardPage() {
  return (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">대시보드</h1>
      </header>

      <div className="mt-2 flex flex-col gap-2 px-4">
        {items.map((it) =>
          it.href ? (
            <a
              key={it.label}
              href={it.href}
              className="flex items-center justify-between rounded-lg bg-neutral-0 px-4 py-4 transition-colors hover:bg-neutral-50"
            >
              <div className="min-w-0">
                <div className="text-body-4 text-neutral-950">{it.label}</div>
                <div className="mt-0.5 truncate text-caption-1 text-neutral-500">{it.desc}</div>
              </div>
              <ChevronRight />
            </a>
          ) : (
            <div key={it.label} className="flex items-center justify-between rounded-lg bg-neutral-0 px-4 py-4" aria-disabled>
              <div className="min-w-0">
                <div className="text-body-4 text-neutral-400">{it.label}</div>
                <div className="mt-0.5 truncate text-caption-1 text-neutral-400">{it.desc}</div>
              </div>
              <span className="text-caption-2 text-neutral-400">준비중</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
