import { cookies } from 'next/headers';
import { getReceivedInquiries } from '@dearbloom/shared';
import { Header } from '@dearbloom/ui';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { RequestList } from './RequestList';

export const dynamic = 'force-dynamic';

export default async function ArtistRequestsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <Header showBack={false} title="신청 관리" />;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <LoginRequired
          description="작가 계정으로 로그인하면 받은 문의를 볼 수 있어요."
          returnUrl="/app/artist/requests"
        />
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
