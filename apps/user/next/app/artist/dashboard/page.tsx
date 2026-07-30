import { ChevronRight } from 'lucide-react';
import { Badge, Card } from '@dearbloom/ui';

const items: { label: string; desc: string; href?: string }[] = [
  { label: '일정 관리', desc: '촬영 가능 일정 · 예약 불가 관리', href: '/app/artist/schedule' },
  { label: '작품 관리', desc: '작품 등록 · 수정 · 삭제', href: '/app/artist/products' },
  { label: '작가 프로필', desc: '소개 · 활동 지역 · 촬영 정보', href: '/app/artist/profile' },
  // 신청은 실제 구현되어 있으므로 준비중이 아니라 정상 진입점(하단탭 '신청'과 동일).
  { label: '신청 현황', desc: '받은 문의 · 예약 관리', href: '/app/artist/requests' },
  // 준비중(포인트) — 출시 전 숨김. 백엔드 준비 후 아래 항목 주석 해제로 복구.
  // { label: '포인트 현황', desc: '준비중', href: '/app/artist/points' },
];

export default async function ArtistDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const imageError = error === 'profile-image' ? (
    <p className="mx-4 mt-2 rounded-lg bg-danger/10 px-4 py-3 text-caption-1 text-danger" role="alert">
      프로필 사진을 저장하지 못했어요. 작가 프로필에서 다시 등록해 주세요.
    </p>
  ) : null;

  return (
    <div className="mx-auto max-w-md">
      <header className="flex h-[52px] items-center justify-center">
        <h1 className="text-head-3 text-neutral-950">대시보드</h1>
      </header>

      {imageError}

      <div className="mt-2 flex flex-col gap-2 px-4">
        {items.map((it) =>
          it.href ? (
            <a
              key={it.label}
              href={it.href}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-4 transition-colors hover:bg-neutral-50"
            >
              <div className="min-w-0">
                <div className="text-body-4 text-neutral-950">{it.label}</div>
                {it.desc === '준비중' ? (
                  <Badge variant="muted" className="mt-0.5">
                    준비중
                  </Badge>
                ) : (
                  <div className="mt-0.5 truncate text-caption-1 text-neutral-500">{it.desc}</div>
                )}
              </div>
              <ChevronRight className="size-6 shrink-0 text-neutral-400" aria-hidden />
            </a>
          ) : (
            <Card key={it.label} className="flex items-center justify-between px-4 py-4" aria-disabled>
              <div className="min-w-0">
                <div className="text-body-4 text-neutral-400">{it.label}</div>
                <div className="mt-0.5 truncate text-caption-1 text-neutral-400">{it.desc}</div>
              </div>
              <Badge variant="muted">준비중</Badge>
            </Card>
          ),
        )}
      </div>
    </div>
  );
}
