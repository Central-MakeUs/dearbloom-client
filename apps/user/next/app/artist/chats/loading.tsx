import { ChatEmptyPane, ChatSplitLayout } from '@dearbloom/features-chat';
import { Header } from '@dearbloom/ui';
import { ChatListSkeleton } from '@/src/components/common/ChatListSkeleton';

/** 고객 채팅 목록과 같은 이유·같은 모양. */
export default function ArtistChatsLoading() {
  return (
    <div className="mx-auto max-w-md lg:max-w-none" aria-busy>
      <Header showBack={false} title="채팅 목록" />
      <ChatSplitLayout sidebar={<ChatListSkeleton />} showSidebarOnMobile belowHeader>
        <ChatEmptyPane />
      </ChatSplitLayout>
      <span className="sr-only">채팅 목록을 불러오는 중이에요.</span>
    </div>
  );
}
