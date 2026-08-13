import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
import { ChatListEditButton, ChatRoomList } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { LoginSheet } from '../../(auth)/LoginSheet';

export const dynamic = 'force-dynamic';


export default async function ChatsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header showBack={false} title="채팅 목록" />
        {/* 탭을 누른 시점에 로그인 필요가 확정이라, 안내만 남기고 로그인 시트를 바로 올린다(QA). */}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <LoginSheet returnUrl="/app/chats" />
        </div>
      </div>
    );
  }

  const rooms = await getChatRooms('CUSTOMER', { token }).catch(() => [] as ChatRoomSummary[]);

  return (
    <div className="mx-auto max-w-md">
      <Header showBack={false} title="채팅 목록" right={<ChatListEditButton />} />
      <ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/chats/${roomId}`} />
    </div>
  );
}
