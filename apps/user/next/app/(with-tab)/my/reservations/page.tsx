import { cookies } from 'next/headers';
import { getMyInquiries, type CustomerInquiryListItem } from '@dearbloom/shared';
import { Button, Header as TitleHeader } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';
import { InquiryHistoryList } from './InquiryHistoryList';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/my" title="문의 내역" />;

export default async function ReservationsPage() {
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

  const items = await getMyInquiries({ token }).catch(() => [] as CustomerInquiryListItem[]);

  return (
    <div className="mx-auto max-w-md">
      <Header />
      <InquiryHistoryList items={items} />
    </div>
  );
}
