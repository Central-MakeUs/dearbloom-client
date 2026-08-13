import { Header } from '@dearbloom/ui';
import { ChatListSkeleton } from '@/src/components/common/ChatListSkeleton';

/** force-dynamic 서버 페치라 응답 전까지 빈 화면이 뜬다 — 목록 모양의 자리표시자를 먼저 보여준다. */
export default function ChatsLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header showBack={false} title="채팅 목록" />
      <ChatListSkeleton />
      <span className="sr-only">채팅 목록을 불러오는 중이에요.</span>
    </div>
  );
}
