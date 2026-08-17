import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { Header } from '@dearbloom/ui';

import { LoginRequired } from '../../(auth)/LoginRequired';
import { WithdrawForm } from './WithdrawForm';

export const dynamic = 'force-dynamic';

export default async function WithdrawPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const token = (await cookies()).get('accessToken')?.value;
  // 작가 모드에서 들어오면 작가 마이페이지로 되돌아가야 한다.
  const { from } = await searchParams;
  const backHref = from === 'artist' ? '/app/artist/my' : '/app/my';

  const page = (children: ReactNode) => (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
      <Header backHref={backHref} title="탈퇴하기" />
      {children}
    </div>
  );

  if (!token) {
    return page(<LoginRequired returnUrl={backHref} />);
  }

  // Figma 실측: 헤더 아래 20px, 좌우 20px, 제목-설명 간격 8px (설명 줄바꿈 기준 폭 306)
  const notice = (
    <div className="flex flex-col gap-2 px-5 pt-5">
      <h2 className="text-head-1 text-neutral-900">탈퇴 전 아래 내용을 확인해 주세요.</h2>
      <p className="max-w-[306px] text-body-2 text-neutral-800">
        탈퇴하면 계정 정보와 모든 활동 기록이 삭제되며 복구할 수 없어요.
      </p>
    </div>
  );

  return page(
    <>
      {notice}
      <WithdrawForm />
    </>,
  );
}
