import { cookies } from 'next/headers';
import { getChatMessages, getChatRooms } from '@dearbloom/shared';
import { ChatRoomView } from '@dearbloom/features-chat';
import { Button, Header } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header title="채팅" showBack={false} />
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <Button asChild size="sm">
            <a href={LOGIN_HREF}>로그인</a>
          </Button>
        </div>
      </div>
    );
  }

  // 방 제목(상대 이름)은 목록 요약에서 가져온다 — 메시지가 없는 방에서도 헤더가 비지 않도록.
  const [rooms, messages] = await Promise.all([
    getChatRooms('CUSTOMER', { token }).catch(() => []),
    getChatMessages('CUSTOMER', id, {}, { token }).catch(() => []),
  ]);
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
