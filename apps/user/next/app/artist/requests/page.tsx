import Link from 'next/link';
import { cookies } from 'next/headers';
import { ChevronRight } from 'lucide-react';
import {
  ampmTimeLabel,
  getReceivedInquiries,
  shortDateLabel,
  type ArtistInquiryListItem,
} from '@dearbloom/shared';
import { Badge, Button, Card, type BadgeProps } from '@dearbloom/ui';
import { AppLogoHeader } from '@/src/components/common/AppLogoHeader';
import { ARTIST_HOME_HREF, LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

/** 문의 상태 → Badge variant (inquiryStatusClass 매핑 로직 유지) */
const statusVariant = (status: string): BadgeProps['variant'] =>
  status === 'RESERVED' ? 'primary' : status.includes('CANCEL') ? 'muted' : 'default';

const Message = ({ children }: { children: string }) => (
  <p className="px-6 py-24 text-center text-body-5 text-neutral-500">{children}</p>
);

export default async function ArtistRequestsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = <AppLogoHeader logoHref={ARTIST_HOME_HREF} />;

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

  const itemCard = (it: ArtistInquiryListItem) => (
    <Link href={`/artist/requests/${it.inquiryId}`} className="block">
      <Card className="p-4 transition-colors hover:bg-neutral-100">
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(it.status)} className="shrink-0">
            {it.statusLabel}
          </Badge>
          <ChevronRight size={20} strokeWidth={2} className="ml-auto text-neutral-400" aria-hidden />
        </div>
        <p className="mt-2 truncate text-body-4 text-neutral-950">{it.artworkName}</p>
        <p className="mt-0.5 truncate text-caption-1 text-neutral-600">
          {it.packageName} · {it.headCount}인 · {it.schoolName}
        </p>
        <p className="mt-2 text-body-4 text-neutral-950">
          {shortDateLabel(it.shootDate)} <span className="text-neutral-300">|</span>{' '}
          {ampmTimeLabel(it.startTime)}
        </p>
      </Card>
    </Link>
  );

  let list = <Message>받은 문의가 없어요.</Message>;
  if (items === null) {
    list = <Message>문의 목록을 불러오지 못했어요.</Message>;
  } else if (items.length > 0) {
    list = (
      <ul className="flex flex-col gap-2 px-4 py-2">
        {items.map((it) => (
          <li key={it.inquiryId}>{itemCard(it)}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {header}
      {list}
    </div>
  );
}
