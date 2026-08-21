'use client';

import { useSearchParams } from 'next/navigation';
import { Header, Skeleton } from '@dearbloom/ui';

/**
 * 저장 목록 자리표시자.
 * 탭 라벨은 데이터가 아니라 고정이므로 그대로 그려서 화면이 덜 흔들리게 한다.
 */
export default function SavedLoading() {
  const isBoardTab = useSearchParams().get('tab') === 'board';

  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header showBack={false} title="저장 목록" />

      <div className="sticky top-[calc(52px+env(safe-area-inset-top))] z-30 flex w-full border-b border-neutral-400 bg-neutral-100">
        <span
          className={
            isBoardTab
              ? '-mb-px flex-1 border-b border-neutral-400 py-3 text-center text-body-1 text-neutral-700'
              : '-mb-px flex-1 border-b-2 border-primary py-3 text-center text-body-1 font-semibold tracking-[-0.01em] text-primary'
          }
        >
          내 저장
        </span>
        <span
          className={
            isBoardTab
              ? '-mb-px flex-1 border-b-2 border-primary py-3 text-center text-body-1 font-semibold tracking-[-0.01em] text-primary'
              : '-mb-px flex-1 border-b border-neutral-400 py-3 text-center text-body-1 text-neutral-700'
          }
        >
          공동보드
        </span>
      </div>

      <div className="px-4 pb-3 pt-3">
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-5 px-4 pb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col">
            <Skeleton className="mb-2 aspect-[4/5] w-full rounded-lg" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-1 h-4 w-20" />
            <Skeleton className="mt-1 h-5 w-16" />
          </div>
        ))}
      </div>
      <span className="sr-only">저장한 작품을 불러오는 중이에요.</span>
    </div>
  );
}
