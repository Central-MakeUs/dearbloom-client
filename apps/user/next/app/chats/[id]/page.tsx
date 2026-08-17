import { cookies } from 'next/headers';
import { ApiError, getChatMessages, getChatRooms } from '@dearbloom/shared';
import { ChatRoomView } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { LoginRequired } from '../../(auth)/LoginRequired';

export const dynamic = 'force-dynamic';

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;

  // 쿠키는 남아있지만 만료된 경우가 있어 401 도 로그인 안내로 수렴시킨다(빈 채팅방이 뜨는 것 방지).
  let expired = false;
  const rooms = token
    ? await getChatRooms('CUSTOMER', { token }).catch((e) => {
        if (e instanceof ApiError && e.status === 401) expired = true;
        return [];
      })
    : [];

  if (!token || expired) {
    return (
      <div className="mx-auto max-w-md">
        <Header title="채팅" showBack={false} />
        <LoginRequired
          description="로그인하고 작가님과 대화를 이어가 보세요."
          returnUrl={`/app/chats/${id}`}
        />
      </div>
    );
  }

  const messages = await getChatMessages('CUSTOMER', id, {}, { token }).catch(() => []);
  // 방 제목(상대 이름)은 목록 요약에서 가져온다 — 메시지가 없는 방에서도 헤더가 비지 않도록.
  const room = rooms.find((r) => String(r.roomId) === id);

  return (
    <ChatRoomView
      roomId={Number(id)}
      myRole="CUSTOMER"
      peerName={room?.peerName ?? '채팅'}
      initialMessages={messages}
      backHref="/app/chats"
    />
  );
}
