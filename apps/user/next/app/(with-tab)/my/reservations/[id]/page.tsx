import { cookies } from 'next/headers';
import {
  ampmTimeLabel,
  compactDateLabel,
  getMyInquiry,
  shortDateLabel,
  type InquiryStatus,
} from '@dearbloom/shared';
import { CancelInquiry } from './CancelInquiry';
import { Header as TitleHeader, SkeletonImage } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/my/reservations" title="문의 상세" />;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <dt className="shrink-0 text-body-4 text-neutral-600">{label}</dt>
    <dd className="text-right text-body-4 text-neutral-950">{value}</dd>
  </div>
);

const STATUS_LABEL: Record<InquiryStatus, string> = {
  IN_PROGRESS: '문의 진행중',
  RESERVED: '예약 완료',
  INQUIRY_CANCELED: '문의 취소',
  RESERVATION_CANCELED: '예약 취소',
};

function statusBadgeClass(status: InquiryStatus): string {
  if (status === 'RESERVED') return 'bg-primary-100 text-primary';
  if (status === 'IN_PROGRESS') return 'bg-neutral-200 text-neutral-700';
  return 'bg-neutral-200 text-neutral-500';
}

/** '1시간 30분' / '45분' */
function durationLabel(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return `${rest}분`;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}

export default async function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;

  const d = token ? await getMyInquiry(id, { token }).catch(() => null) : null;
  if (!d) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <p className="px-4 py-16 text-center text-body-5 text-neutral-500">문의를 불러오지 못했어요.</p>
      </div>
    );
  }

  const summary = (
    <div className="flex gap-3">
      <SkeletonImage src={d.artworkImageUrl} alt="" className="h-[100px] w-[76px] shrink-0 rounded-md" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={`inline-block rounded-md px-2 py-1 text-caption-1 ${statusBadgeClass(d.status)}`}>
            {STATUS_LABEL[d.status]}
          </span>
          <span className="text-body-5 text-neutral-500">{compactDateLabel(d.requestedAt)} 문의</span>
        </div>
        <p className="mt-2 truncate text-body-3 font-semibold text-neutral-950">{d.artworkName}</p>
        {d.artistNickname && (
          <p className="mt-0.5 truncate text-body-5 text-neutral-500">{d.artistNickname}</p>
        )}
      </div>
    </div>
  );

  const reservation = (
    <dl className="border-t border-neutral-200 pt-3">
      <Row label="예약 날짜" value={shortDateLabel(d.shootDate)} />
      <Row label="예약 시간" value={ampmTimeLabel(d.startTime)} />
      <Row label="패키지 선택" value={d.packageName} />
    </dl>
  );

  const shooting = (
    <dl className="border-t border-neutral-200 pt-3">
      <Row label="촬영 종료 시간" value={ampmTimeLabel(d.endTime)} />
      <Row label="소요 시간" value={durationLabel(d.durationMinutes)} />
      <Row label="가격" value={`${d.price.toLocaleString()}원`} />
      <Row label="학교" value={d.schoolName} />
      <Row label="인원" value={`${d.headCount}명`} />
    </dl>
  );

  const requestNote = (
    <div className="border-t border-neutral-200 pt-3">
      <p className="text-body-4 text-neutral-600">요청 사항</p>
      <p className="mt-3 whitespace-pre-line text-body-4 text-neutral-950">{d.requestNote ?? '없음'}</p>
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <div className="px-4 py-3">
        <div className="flex flex-col gap-4 rounded-lg bg-neutral-0 p-4">
          {summary}
          {reservation}
          {shooting}
          {requestNote}
          {/* 고객이 취소할 수 있는 건 진행중 문의뿐 — 예약 취소는 작가 전용 API 다. */}
          {d.status === 'IN_PROGRESS' && <CancelInquiry id={d.inquiryId} />}
        </div>
      </div>
    </div>
  );
}
