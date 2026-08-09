import { cookies } from 'next/headers';
import { ampmTimeLabel, getReceivedInquiry, shortDateLabel } from '@dearbloom/shared';
import { Card, CardContent, Header as TitleHeader, cn } from '@dearbloom/ui';
import { durationLabel } from '@/src/lib/inquiry';
import { InquiryActions } from './InquiryActions';
import { ACTION_BAR_OFFSET, hasInquiryActions } from './actionBar';
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

  const detail = (
    <div className="px-4 py-3">
      <Card className="overflow-hidden">
        {/* 작품 이미지는 외부 URL 이라 next/image 의 remotePatterns 설정이 없다 — 앱 공통 규약대로 img 사용. */}
        <img src={d.artworkImageUrl} alt={d.artworkName} className="aspect-[4/3] w-full object-cover" />
        <CardContent>
          <h2 className="text-head-3 text-neutral-950">{d.artworkName}</h2>
          <dl className="mt-2 border-t border-neutral-200 pt-2">
            <Row label="패키지" value={d.packageName} />
            <Row label="인원" value={`${d.headCount}인`} />
            <Row label="가격" value={`${d.price.toLocaleString()}원`} />
            <Row label="학교" value={d.schoolName} />
            <Row label="촬영 날짜" value={shortDateLabel(d.shootDate)} />
            <Row
              label="촬영 시간"
              value={`${ampmTimeLabel(d.startTime)} ~ ${ampmTimeLabel(d.endTime)}`}
            />
            <Row label="소요 시간" value={durationLabel(d.durationMinutes)} />
          </dl>
          {/* 요청사항은 길어질 수 있어 우측정렬 대신 라벨 아래 왼쪽정렬로 흘린다. */}
          <div className="mt-2 border-t border-neutral-200 pt-2">
            <p className="text-body-6 text-neutral-600">요청사항</p>
            <p className="mt-1.5 whitespace-pre-line break-words text-body-5 text-neutral-950">
              {d.requestNote ?? '없음'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    // 하단 고정 액션바가 콘텐츠를 덮지 않도록, 버튼이 뜨는 상태에서만 그만큼 여백을 준다.
    <div className={cn('mx-auto max-w-md', hasInquiryActions(d.status) && ACTION_BAR_OFFSET)}>
      <Header />
      {detail}
      {token && <InquiryTimeline id={id} token={token} />}
      {/* 상태는 상세 응답을 신뢰한다 — 쿼리스트링으로 받으면 직접 진입/전이 직후에 실제 상태와 어긋난다. */}
      <InquiryActions id={d.inquiryId} status={d.status} />
    </div>
  );
}
