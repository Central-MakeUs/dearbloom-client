import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
// 편집 버튼을 되살릴 땐 ChatListEditButton 임포트도 함께 푼다.
import { /* ChatListEditButton, */ ChatRoomList } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { AppLink } from '@/src/components/common/AppLink';
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
      {/* 편집(⌸) 아이콘은 아직 안 쓰므로 뺀다 — 되살릴 땐 right={<ChatListEditButton />}. */}
      <Header showBack={false} title="채팅 목록" />
      <ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/chats/${roomId}`} linkComponent={AppLink} />
    </div>
  );
}
