import { chatTimestampLabel, type ChatRoomSummary } from '@dearbloom/shared';

interface ChatRoomListProps {
  rooms: ChatRoomSummary[];
  /** 방 상세 경로 (고객 `/app/chats/{id}`, 작가 `/app/artist/chats/{id}`). */
  roomHref: (roomId: number) => string;
}

/** 채팅 목록 — 최근 메시지순. 상대 이름·프로필, 마지막 메시지 미리보기, 안읽음 수. */
export function ChatRoomList({ rooms, roomHref }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return <p className="px-6 py-24 text-center text-body-5 text-neutral-500">아직 채팅이 없어요.</p>;
  }

  return (
    <ul className="flex flex-col">
      {rooms.map((room) => (
        <li key={room.roomId}>
          <a href={roomHref(room.roomId)} className="flex items-center gap-3 px-4 py-3">
            {room.peerImageUrl ? (
              <img src={room.peerImageUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="h-12 w-12 shrink-0 rounded-full bg-neutral-200" aria-hidden />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-body-3 text-neutral-950">{room.peerName}</span>
                {room.lastMessageAt && (
                  <span className="shrink-0 text-caption-2 text-neutral-500">
                    {chatTimestampLabel(room.lastMessageAt)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 truncate text-body-5 text-neutral-600">
                {room.lastMessagePreview ?? ''}
              </p>
            </div>

            {room.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-caption-3 text-neutral-0">
                {room.unreadCount}
              </span>
            )}
          </a>
        </li>
      ))}
    </ul>
  );
}
