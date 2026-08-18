import { cookies } from 'next/headers';
import { User } from 'lucide-react';
import {
  ampmTimeLabel,
  compactDateLabel,
  getReceivedInquiry,
  shortDateLabel,
  type InquiryStatus,
} from '@dearbloom/shared';
import { Badge, Card, CardContent, SkeletonImage, cn, type BadgeProps } from '@dearbloom/ui';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';
import { durationLabel } from '@/src/lib/inquiry';
import { InquiryActions } from './InquiryActions';
import { ACTION_BAR_OFFSET, hasInquiryActions } from './actionBar';
import { InquiryTimeline } from './InquiryTimeline';

export const dynamic = 'force-dynamic';

const Header = () => <AppBackHeader fallbackHref="/app/artist/requests" title="신청 상세" />;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 py-1.5">
    <dt className="shrink-0 text-body-6 text-neutral-600">{label}</dt>
    <dd className="text-right text-body-5 text-neutral-950">{value}</dd>
  </div>
);

/** 목록 응답과 달리 상세 응답에는 statusLabel 이 없어 여기서 붙인다. */
const STATUS_LABEL: Record<InquiryStatus, string> = {
  IN_PROGRESS: '문의 진행중',
  RESERVED: '예약 완료',
  INQUIRY_CANCELED: '문의 취소',
  RESERVATION_CANCELED: '예약 취소',
};

const statusVariant = (status: InquiryStatus): BadgeProps['variant'] =>
  status === 'RESERVED' ? 'primary' : status.includes('CANCEL') ? 'muted' : 'default';

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

  // 작가에게 가장 먼저 필요한 정보는 "누가, 언제 신청했고, 지금 어떤 상태인가" 다.
  const requester = (
    <div className="px-4 pt-3">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(d.status)} className="shrink-0">
            {STATUS_LABEL[d.status]}
          </Badge>
          <span className="truncate text-caption-1 text-neutral-500">
            {compactDateLabel(d.requestedAt)} 문의
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span
            aria-hidden
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500"
          >
            <User size={16} strokeWidth={2} />
          </span>
          <span className="truncate text-body-4 text-neutral-950">{d.customerName ?? '고객'}</span>
          <span className="shrink-0 text-caption-1 text-neutral-500">{d.headCount}인</span>
        </div>
      </Card>
    </div>
  );

  const detail = (
    <div className="px-4 py-3">
      <Card className="overflow-hidden">
        {/* 작품 이미지는 외부 URL 이라 next/image 의 remotePatterns 설정이 없다 — 앱 공통 규약대로 img 사용. */}
        <SkeletonImage src={d.artworkImageUrl} alt={d.artworkName} className="aspect-[4/3] w-full" />
        <CardContent>
          <h2 className="text-head-3 text-neutral-950">{d.artworkName}</h2>
          <dl className="mt-2 border-t border-neutral-200 pt-2">
            {/* 인원은 위 신청자 카드에 이미 있어 여기서는 생략한다. */}
            <Row label="패키지" value={d.packageName} />
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
      {requester}
      {detail}
      {token && <InquiryTimeline id={id} token={token} />}
      {/* 상태는 상세 응답을 신뢰한다 — 쿼리스트링으로 받으면 직접 진입/전이 직후에 실제 상태와 어긋난다. */}
      <InquiryActions id={d.inquiryId} status={d.status} />
    </div>
  );
}
