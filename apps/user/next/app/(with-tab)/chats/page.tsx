import { cookies } from 'next/headers';
import { getChatRooms, type ChatRoomSummary } from '@dearbloom/shared';
import { ChatRoomList } from '@dearbloom/features-chat';
import { Button } from '@dearbloom/ui';
import { AppLogoHeader } from '@/src/components/common/AppLogoHeader';
import { CUSTOMER_HOME_HREF, LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

const Header = () => <AppLogoHeader logoHref={CUSTOMER_HOME_HREF} />;

export default async function ChatsPage() {
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

  const rooms = await getChatRooms('CUSTOMER', { token }).catch(() => [] as ChatRoomSummary[]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <ChatRoomList rooms={rooms} roomHref={(roomId) => `/app/chats/${roomId}`} />
    </div>
  );
}
