import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
// 편집 버튼을 되살릴 땐 ChatListEditButton 임포트도 함께 푼다.
import { /* ChatListEditButton, */ ChatEmptyPane, ChatRoomList, ChatSplitLayout } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { AppLink } from '@/src/components/common/AppLink';
import { LoginRequired } from '../../(auth)/LoginRequired';

export const dynamic = 'force-dynamic';


export default async function ChatsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header showBack={false} title="채팅 목록" />
        <LoginRequired
          description="로그인하고 작가님께 문의를 시작해 보세요."
          returnUrl="/app/chats"
        />
      </div>
    );
  }

  const rooms = await getChatRooms('CUSTOMER', { token }).catch(() => [] as ChatRoomSummary[]);

  // PC(lg 이상)는 왼쪽 목록 + 오른쪽 빈 대화 패널. 방을 고르면 채팅방 화면이 같은 틀로 이어진다.
  return (
    <div className="mx-auto max-w-md lg:max-w-none">
      {/* 편집(⌸) 아이콘은 아직 안 쓰므로 뺀다 — 되살릴 땐 right={<ChatListEditButton />}. */}
      <Header showBack={false} title="채팅 목록" />
      <ChatSplitLayout
        sidebar={<ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/chats/${roomId}`} linkComponent={AppLink} />}
        showSidebarOnMobile
        belowHeader
      >
        <ChatEmptyPane />
      </ChatSplitLayout>
    </div>
  );
}
