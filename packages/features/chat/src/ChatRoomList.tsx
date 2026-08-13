import type { AnchorHTMLAttributes, ComponentType } from 'react';
import { SkeletonImage } from '@dearbloom/ui';
import { chatTimestampLabel, type ChatRoomSummary } from '@dearbloom/shared';

interface ChatRoomListProps {
  rooms: ChatRoomSummary[];
  /** 방 상세 경로 (고객 `/app/chats/{id}`, 작가 `/app/artist/chats/{id}`). */
  roomHref: (roomId: number) => string;
  /** 링크를 그릴 컴포넌트. 기본은 `<a>`(문서 이동). Next 앱은 AppLink 를 넘겨 클라이언트 라우팅합니다. */
  linkComponent?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
}

/**
 * 채팅 목록 — 최근 메시지순. 상대 이름·프로필, 마지막 메시지 미리보기, 안읽음 수.
 *
 * Figma 233:6353 실측 — 좌우 16, 헤더 아래 20, 행 간격 32(구분선 없음),
 * 아바타 52 원형, 아바타↔본문 12, 이름↔미리보기 4.
 */
export function ChatRoomList({ rooms, roomHref, linkComponent }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return <p className="px-6 py-24 text-center text-body-5 text-neutral-500">아직 채팅이 없어요.</p>;
  }

  const Anchor = linkComponent ?? 'a';

  return (
    <ul className="flex flex-col gap-8 px-4 pt-5">
      {rooms.map((room) => (
        <li key={room.roomId}>
          <Anchor href={roomHref(room.roomId)} className="flex items-center gap-3">
            {/* 프로필이 없으면 SkeletonImage 가 회색 원만 남긴다 — 없는 이미지를 깜빡이게 두지 않는다. */}
            <SkeletonImage
              src={room.peerImageUrl ?? undefined}
              alt=""
              className="h-[52px] w-[52px] shrink-0 rounded-full border border-neutral-200"
            />

            <div className="min-w-0 flex-1">
              {/* Head2_sb_16 — 크기·굵기는 head-3 와 같고 자간만 -1% 다르다. */}
              <p className="truncate text-head-3 tracking-[-0.01em] text-neutral-950">{room.peerName}</p>
              <p className="mt-1 truncate text-body-5 text-neutral-600">{room.lastMessagePreview ?? ''}</p>
            </div>

            {/* 시각은 행 위쪽, 안읽음 배지는 행 아래쪽에 붙는다(아바타 높이 52 기준). */}
            <div className="flex h-[52px] shrink-0 flex-col items-end justify-between pb-0.5 pt-[5px]">
              <span className="text-caption-1 text-neutral-500">
                {room.lastMessageAt ? chatTimestampLabel(room.lastMessageAt) : ''}
              </span>
              {room.unreadCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-[7px] text-caption-2 text-neutral-0">
                  {room.unreadCount}
                </span>
              )}
            </div>
          </Anchor>
        </li>
      ))}
    </ul>
  );
}
