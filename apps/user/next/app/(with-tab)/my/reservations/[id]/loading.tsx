import { Skeleton } from '@dearbloom/ui';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

/** 문의 상세도 force-dynamic 이라 응답 전까지 빈 화면이 뜬다. */
export default function ReservationDetailLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <AppBackHeader fallbackHref="/app/my/reservations" title="문의 상세" />
      <div className="px-4 py-3">
        <div className="flex flex-col gap-4 rounded-lg bg-neutral-0 p-4">
          <div className="flex gap-3">
            <Skeleton className="h-[100px] w-[76px] shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="mt-2 h-5 w-36" />
              <Skeleton className="mt-1 h-4 w-24" />
            </div>
          </div>

          {/* 예약(3줄) · 촬영(5줄) · 요청 사항 */}
          {[3, 5].map((rows, section) => (
            <dl key={section} className="flex flex-col gap-2 border-t border-neutral-200 pt-3">
              {Array.from({ length: rows }, (_, i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-28" />
                </div>
              ))}
            </dl>
          ))}
          <div className="border-t border-neutral-200 pt-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="mt-3 h-5 w-full" />
          </div>
        </div>
      </div>
      <span className="sr-only">문의 상세를 불러오는 중이에요.</span>
    </div>
  );
}
