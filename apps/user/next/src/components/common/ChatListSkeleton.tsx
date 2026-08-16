import { Skeleton } from '@dearbloom/ui';

/** 채팅 목록 자리표시자 — 고객·작가 목록이 같은 모양이라 공용입니다. ChatRoomList 의 간격을 따릅니다. */
export function ChatListSkeleton() {
  return (
    <ul className="flex flex-col gap-8 px-4 pt-5">
      {[0, 1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-center gap-3">
          <Skeleton className="h-[52px] w-[52px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-1.5 h-4 w-44" />
          </div>
          <Skeleton className="h-4 w-10 shrink-0" />
        </li>
      ))}
    </ul>
  );
}
