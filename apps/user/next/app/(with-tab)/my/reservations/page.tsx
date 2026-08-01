import { cookies } from 'next/headers';
import { getMyInquiries, type CustomerInquiryListItem } from '@dearbloom/shared';
import { Button } from '@dearbloom/ui';
import { LOGIN_HREF } from '@/src/lib/env';
import { InquiryHistoryList } from './InquiryHistoryList';

export const dynamic = 'force-dynamic';

const Header = () => (
  <header className="sticky top-0 z-10 flex h-[52px] items-center bg-neutral-100 px-2">
    <a href="/app/my" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="m15 18-6-6 6-6" />
      </svg>
    </a>
    <h1 className="absolute left-1/2 -translate-x-1/2 text-head-3 text-neutral-950">문의 내역</h1>
  </header>
);

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
