import { cookies } from 'next/headers';
import { getReceivedInquiries } from '@dearbloom/shared';
import { Button, Header } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';
import { RequestList } from './RequestList';

export const dynamic = 'force-dynamic';

export default async function ArtistRequestsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header showBack={false} title="신청 관리" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
          <Button asChild size="sm">
            <a href={LOGIN_HREF}>로그인</a>
          </Button>
        </div>
      </div>
    );
  }

  // 실패를 빈 배열로 뭉개면 "받은 문의가 없어요" 로 잘못 안내된다 — null 로 구분한다.
  const items = await getReceivedInquiries({ token }).catch(() => null);

  return (
    <div className="mx-auto max-w-md">
      {header}
      {items === null ? (
        <p className="px-6 py-24 text-center text-body-5 text-neutral-500">
          문의 목록을 불러오지 못했어요.
        </p>
      ) : (
        <RequestList items={items} />
      )}
    </div>
  );
}
