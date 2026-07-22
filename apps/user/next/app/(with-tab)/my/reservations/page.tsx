type Status = 'pending' | 'in_progress' | 'reserved' | 'done';

interface Reservation {
  id: string;
  snapId: string;
  title: string;
  artist: string;
  status: Status;
  meta: string;
  note?: string;
}

const statusTabs: Array<{ key: Status | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'pending', label: '답변 대기' },
  { key: 'in_progress', label: '상담 중' },
  { key: 'reserved', label: '예약 완료' },
  { key: 'done', label: '종료' },
];

const statusLabel: Record<Status, string> = {
  pending: '답변 대기',
  in_progress: '상담 중',
  reserved: '예약 완료',
  done: '종료',
};

const statusStyle: Record<Status, string> = {
  pending: 'bg-neutral-200 text-neutral-700',
  in_progress: 'bg-primary-100 text-primary',
  reserved: 'bg-primary text-neutral-0',
  done: 'bg-neutral-100 text-neutral-500',
};

const reservations: Reservation[] = [
  {
    id: 'r-1',
    snapId: 'snap-1',
    title: '벚꽃엔딩',
    artist: '하늘 스튜디오',
    status: 'reserved',
    meta: '2026-04-05 (토) 14:00',
    note: '3인, 홍대입구역 근처 벚꽃길',
  },
  {
    id: 'r-2',
    snapId: 'snap-3',
    title: '가을 프리즘',
    artist: '노을 필름',
    status: 'in_progress',
    meta: '문의 진행 중',
    note: '가족 4인, 지역·시간 협의 중',
  },
  {
    id: 'r-3',
    snapId: 'snap-8',
    title: '캠퍼스 라이트',
    artist: '무브먼트',
    status: 'pending',
    meta: '오늘 09:12 문의',
  },
  {
    id: 'r-4',
    snapId: 'snap-2',
    title: '노을 아래',
    artist: '수아 필름',
    status: 'done',
    meta: '2025-12-01 촬영 완료',
  },
];

export default function ReservationsPage() {
  const header = (
    <header className="px-4 pt-6">
      <h1 className="text-head-2 text-neutral-950">예약·문의 내역</h1>
    </header>
  );

  const tabBar = (
    <div className="mt-4 flex gap-2 overflow-x-auto px-4 pb-3">
      {statusTabs.map((t, i) => (
        <button
          key={t.key}
          type="button"
          className={`whitespace-nowrap rounded-full px-4 py-1.5 text-body-4 transition-colors ${
            i === 0 ? 'bg-primary text-neutral-0' : 'bg-neutral-0 text-neutral-700 border border-neutral-200'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );

  const list = (
    <div className="flex flex-col gap-3 px-4 pb-6">
      {reservations.map((r) => (
        <article key={r.id} className="flex gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-3">
          <a
            href={`/snaps/${r.snapId}`}
            className="h-20 w-20 shrink-0 rounded-md bg-gradient-to-br from-primary-100 to-primary-300"
            aria-label={`${r.title} 상세 이동`}
          />
          <div className="flex-1 min-w-0">
            <div className="mb-1 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="line-clamp-1 text-body-4 text-neutral-950">{r.title}</div>
                <div className="text-caption-2 text-neutral-600">{r.artist}</div>
              </div>
              <span className={`shrink-0 rounded-md px-2 py-0.5 text-caption-3 ${statusStyle[r.status]}`}>
                {statusLabel[r.status]}
              </span>
            </div>
            <div className="text-caption-1 text-neutral-700">{r.meta}</div>
            {r.note ? (
              <div className="mt-1 line-clamp-1 text-caption-2 text-neutral-500">{r.note}</div>
            ) : null}
            <a href="#" className="mt-2 inline-block text-caption-1 text-primary">
              채팅방 이동 →
            </a>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-md">
      {header}
      {tabBar}
      {list}
    </div>
  );
}
