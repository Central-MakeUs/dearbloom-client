import { cookies } from 'next/headers';
import { getMyInquiries, type CustomerInquiryListItem } from '@dearbloom/shared';
import { Header as TitleHeader } from '@dearbloom/ui';
import { LoginRequired } from '../../../(auth)/LoginRequired';
import { InquiryHistoryList } from './InquiryHistoryList';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/my" title="문의 내역" />;

export default async function ReservationsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <Header />
        <LoginRequired
          description="로그인하고 문의 내역을 확인해 보세요."
          returnUrl="/app/my/reservations"
        />
      </div>
    );
  }

  const items = await getMyInquiries({ token }).catch(() => [] as CustomerInquiryListItem[]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <InquiryHistoryList items={items} />
    </div>
  );
}
