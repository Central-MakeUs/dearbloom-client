import { Header as TitleHeader, Skeleton } from '@dearbloom/ui';

/**
 * 문의 내역 자리표시자.
 * 탭·필터 칩은 고정 라벨이라 그대로 그리고, 목록만 자리표시자로 둔다.
 */
export default function ReservationsLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <TitleHeader backHref="/app/my" title="문의 내역" />

      <div className="flex border-b border-neutral-200">
        <span className="flex-1 border-b-2 border-primary py-3 text-center text-body-3 text-primary">
          문의내역
        </span>
        <span className="flex-1 border-b-2 border-transparent py-3 text-center text-body-3 text-neutral-600">
          취소내역
        </span>
      </div>

      <div className="flex gap-2 px-4 py-3">
        {['전체', '진행중', '예약완료'].map((label, i) => (
          <span
            key={label}
            className={`rounded-full border px-4 py-2 text-body-5 ${
              i === 0
                ? 'border-primary bg-primary text-neutral-0'
                : 'border-neutral-300 text-neutral-700'
            }`}
          >
            {label}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-3 px-4 pb-4">
        {[0, 1, 2].map((i) => (
          <li key={i} className="rounded-lg bg-neutral-0 p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="mt-3 flex gap-3">
              <Skeleton className="h-[76px] w-[76px] shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="mt-1 h-4 w-20" />
                <Skeleton className="mt-2 h-5 w-40" />
                <Skeleton className="mt-1 h-5 w-28" />
              </div>
            </div>
          </li>
        ))}
      </ul>
      <span className="sr-only">문의 내역을 불러오는 중이에요.</span>
    </div>
  );
}
