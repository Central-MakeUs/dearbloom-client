import { Header, Skeleton } from '@dearbloom/ui';

/**
 * 채팅방 자리표시자 — 방 목록과 메시지를 둘 다 받아야 열려서 대기가 길다.
 * 상대 이름은 아직 모르므로 헤더 제목은 '채팅' 으로 둔다(응답 오면 이름으로 바뀐다).
 */
export function ChatRoomSkeleton({ backHref }: { backHref: string }) {
  const bubbles = [
    { mine: false, width: 'w-40' },
    { mine: true, width: 'w-28' },
    { mine: false, width: 'w-52' },
    { mine: true, width: 'w-36' },
  ];

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-neutral-100" aria-busy>
      <Header backHref={backHref} title="채팅" />
      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {bubbles.map((b, i) => (
          <Skeleton
            key={i}
            className={`h-10 rounded-2xl ${b.width} ${b.mine ? 'self-end' : 'self-start'}`}
          />
        ))}
      </div>
      <div className="border-t border-neutral-200 bg-neutral-0 px-4 py-3">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>
      <span className="sr-only">대화를 불러오는 중이에요.</span>
    </div>
  );
}
