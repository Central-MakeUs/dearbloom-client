import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
import { ChatRoomList } from '@dearbloom/features-chat';
import { Button } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

const Header = () => (
  <header className="sticky top-0 z-10 flex h-[52px] items-center justify-center bg-neutral-100">
    <h1 className="text-head-3 text-neutral-950">채팅 목록</h1>
  </header>
);

export default async function ArtistChatsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <Button asChild size="sm">
            <a href={LOGIN_HREF}>로그인</a>
          </Button>
        </div>
      </div>
    );
  }

  const rooms = await getChatRooms('ARTIST', { token }).catch(() => [] as ChatRoomSummary[]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/artist/chats/${roomId}`} />
    </div>
  );
}
