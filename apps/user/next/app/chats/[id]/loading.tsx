import { ChatRoomSkeleton } from '@/src/components/common/ChatRoomSkeleton';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

export default function ChatDetailLoading() {
  return <ChatRoomSkeleton backHref="/app/chats" header={<AppBackHeader fallbackHref="/app/chats" title="채팅" />} />;
}
