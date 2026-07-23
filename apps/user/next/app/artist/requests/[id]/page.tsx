import { cookies } from 'next/headers';
import { getReceivedInquiry } from '@dearbloom/shared';
import { shootLabel } from '@/src/lib/inquiry';
import { InquiryActions } from './InquiryActions';

export const dynamic = 'force-dynamic';

const Header = () => (
  <header className="sticky top-0 z-10 flex h-[52px] items-center bg-neutral-100 px-2">
    <a href="/app/artist/requests" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-head-3 text-neutral-950">신청 상세</h1>
  </header>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <dt className="shrink-0 text-body-6 text-neutral-600">{label}</dt>
    <dd className="text-right text-body-5 text-neutral-950">{value}</dd>
  </div>
);

export default async function ArtistRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { id } = await params;
  const { status } = await searchParams;
  const token = (await cookies()).get('accessToken')?.value;

  const d = token ? await getReceivedInquiry(id, { token }).catch(() => null) : null;
  if (!d) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <p className="px-4 py-16 text-center text-body-5 text-neutral-500">문의를 불러오지 못했어요.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <div className="px-4 py-3">
        <div className="overflow-hidden rounded-lg bg-neutral-0">
          <img src={d.artworkImageUrl} alt={d.artworkName} className="aspect-[4/3] w-full object-cover" />
          <div className="p-4">
            <h2 className="text-head-3 text-neutral-950">{d.artworkName}</h2>
            <dl className="mt-2 border-t border-neutral-200 pt-2">
              <Row label="패키지" value={d.packageName} />
              <Row label="인원" value={`${d.headCount}인`} />
              <Row label="가격" value={`${d.price.toLocaleString()}원`} />
              <Row label="학교" value={d.schoolName} />
              <Row label="촬영 일시" value={`${shootLabel(d.shootDate, d.dayOfWeek, d.startTime)}~${d.endTime.slice(0, 5)}`} />
              <Row label="요청사항" value={d.requestNote ?? '없음'} />
            </dl>
          </div>
        </div>
      </div>
      <InquiryActions id={d.inquiryId} status={status} />
    </div>
  );
}
