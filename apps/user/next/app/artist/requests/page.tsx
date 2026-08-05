import { cookies } from 'next/headers';
import { getReceivedInquiries, type ArtistInquiryListItem } from '@dearbloom/shared';
import { Badge, type BadgeProps } from '@dearbloom/ui';
import { shootLabel } from '@/src/lib/inquiry';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

/** 문의 상태 → Badge variant (inquiryStatusClass 매핑 로직 유지) */
const statusVariant = (status: string): BadgeProps['variant'] =>
  status === 'RESERVED' ? 'primary' : status.includes('CANCEL') ? 'muted' : 'default';

export default async function ArtistRequestsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = (
    <header className="flex h-[52px] items-center justify-center">
      <h1 className="text-head-3 text-neutral-950">신청 관리</h1>
    </header>
  );

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
        </div>
      </div>
    );
  }

  const items = await getReceivedInquiries({ token }).catch(() => [] as ArtistInquiryListItem[]);

  return (
    <div className="mx-auto max-w-md">
      {header}
      {items.length === 0 ? (
        <p className="px-6 py-24 text-center text-body-5 text-neutral-500">받은 문의가 없어요.</p>
      ) : (
        <ul className="flex flex-col gap-2 px-4 py-2">
          {items.map((it) => (
            <li key={it.inquiryId}>
              <a href={`/app/artist/requests/${it.inquiryId}`} className="block rounded-lg border border-neutral-200 bg-neutral-0 p-4 transition-colors hover:bg-neutral-50">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-body-4 text-neutral-950">{it.artworkName}</span>
                  <Badge variant={statusVariant(it.status)} className="shrink-0">{it.statusLabel}</Badge>
                </div>
                <p className="mt-1 truncate text-caption-1 text-neutral-600">{it.packageName} · {it.headCount}인 · {it.schoolName}</p>
                <p className="mt-0.5 text-caption-1 text-neutral-500">{shootLabel(it.shootDate, it.dayOfWeek, it.startTime)}</p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
