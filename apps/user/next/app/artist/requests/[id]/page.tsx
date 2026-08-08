import { cookies } from 'next/headers';
import { getReceivedInquiry } from '@dearbloom/shared';
import { Card, CardContent, Header as TitleHeader } from '@dearbloom/ui';
import { shootLabel } from '@/src/lib/inquiry';
import { InquiryActions } from './InquiryActions';
import { InquiryTimeline } from './InquiryTimeline';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/artist/requests" title="신청 상세" />;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <dt className="shrink-0 text-body-6 text-neutral-600">{label}</dt>
    <dd className="text-right text-body-5 text-neutral-950">{value}</dd>
  </div>
);

export default async function ArtistRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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
        <Card className="overflow-hidden">
          <img src={d.artworkImageUrl} alt={d.artworkName} className="aspect-[4/3] w-full object-cover" />
          <CardContent>
            <h2 className="text-head-3 text-neutral-950">{d.artworkName}</h2>
            <dl className="mt-2 border-t border-neutral-200 pt-2">
              <Row label="패키지" value={d.packageName} />
              <Row label="인원" value={`${d.headCount}인`} />
              <Row label="가격" value={`${d.price.toLocaleString()}원`} />
              <Row label="학교" value={d.schoolName} />
              <Row label="촬영 일시" value={`${shootLabel(d.shootDate, d.dayOfWeek, d.startTime)}~${d.endTime.slice(0, 5)}`} />
              <Row label="요청사항" value={d.requestNote ?? '없음'} />
            </dl>
          </CardContent>
        </Card>
      </div>
      {token && <InquiryTimeline id={id} token={token} />}
      {/* 상태는 상세 응답을 신뢰한다 — 쿼리스트링으로 받으면 직접 진입/전이 직후에 실제 상태와 어긋난다. */}
      <InquiryActions id={d.inquiryId} status={d.status} />
    </div>
  );
}
