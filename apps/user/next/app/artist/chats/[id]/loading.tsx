import { ChatRoomSkeleton } from '@/src/components/common/ChatRoomSkeleton';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

export default function ArtistChatDetailLoading() {
  return <ChatRoomSkeleton backHref="/app/artist/chats" header={<AppBackHeader fallbackHref="/app/artist/chats" title="채팅" />} />;
}
