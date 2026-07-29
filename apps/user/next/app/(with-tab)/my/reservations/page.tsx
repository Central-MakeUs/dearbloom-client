import { cookies } from 'next/headers';
import { getMyInquiries, type CustomerInquiryListItem } from '@dearbloom/shared';
import { Badge, type BadgeProps, Button, Card } from '@dearbloom/ui';
import { shootLabel } from '@/src/lib/inquiry';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

/** inquiryStatusClass 의 색상 매핑을 Badge variant 로 옮긴 것. */
function inquiryStatusVariant(status: string): BadgeProps['variant'] {
  if (status === 'RESERVED') return 'primary';
  if (status.includes('CANCEL')) return 'muted';
  return 'default';
}

const Header = () => (
  <header className="sticky top-0 z-10 flex h-[52px] items-center bg-neutral-100 px-2">
    <a href="/app/my" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-head-3 text-neutral-950">예약·문의 내역</h1>
  </header>
);

export default async function ReservationsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <Button asChild size="sm">
            <a href={LOGIN_HREF}>로그인</a>
          </Button>
        </div>
      </div>
    );
  }

  const items = await getMyInquiries({ token }).catch(() => [] as CustomerInquiryListItem[]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      {items.length === 0 ? (
        <p className="px-6 py-24 text-center text-body-5 text-neutral-500">문의 내역이 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-2 px-4 py-2">
          {items.map((it) => (
            <li key={it.inquiryId}>
              <Card className="transition-colors hover:bg-neutral-50">
                <a href={`/app/my/reservations/${it.inquiryId}?status=${it.status}`} className="flex gap-3 p-3">
                  <img src={it.artworkImageUrl} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-body-4 text-neutral-950">{it.artworkName}</span>
                      <Badge variant={inquiryStatusVariant(it.status)} className="shrink-0">{it.statusLabel}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-caption-1 text-neutral-600">{it.artistNickname}</p>
                    <p className="mt-0.5 text-caption-1 text-neutral-500">{shootLabel(it.shootDate, it.dayOfWeek, it.startTime)}</p>
                  </div>
                </a>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
