import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
// 편집 버튼을 되살릴 땐 ChatListEditButton 임포트도 함께 푼다.
import { /* ChatListEditButton, */ ChatRoomList } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { AppLink } from '@/src/components/common/AppLink';

export const dynamic = 'force-dynamic';


export default async function ArtistChatsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header showBack={false} title="채팅 목록" />
        <LoginRequired
          description="작가 계정으로 로그인하면 문의 채팅을 볼 수 있어요."
          returnUrl="/app/artist/chats"
        />
      </div>
    );
  }

  const rooms = await getChatRooms('ARTIST', { token }).catch(() => [] as ChatRoomSummary[]);

  return (
    <div className="mx-auto max-w-md">
      {/* 편집(⌸) 아이콘은 아직 안 쓰므로 뺀다 — 되살릴 땐 right={<ChatListEditButton />}. */}
      <Header showBack={false} title="채팅 목록" />
      <ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/artist/chats/${roomId}`} linkComponent={AppLink} />
    </div>
  );
}
