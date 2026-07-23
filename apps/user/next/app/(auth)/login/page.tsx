import Image from 'next/image';

import type { AuthRole } from '@dearbloom/features-auth';

import dearBloomLogo from '../../../public/images/dearbloom-logo.png';
import { SocialLoginButtons } from '../SocialLoginButtons';

type LoginPageProps = {
  searchParams: Promise<{ auth?: string; role?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { auth, role: roleParam } = await searchParams;
  const role: AuthRole = roleParam === 'ARTIST' ? roleParam : 'CUSTOMER';

  const brand = (
    <div className="flex flex-col items-center">
      <Image
        alt="DearBloom"
        className="h-[70px] w-[252px]"
        height={70}
        priority
        src={dearBloomLogo}
        width={252}
      />
      <p className="w-[252px] text-body-2 text-neutral-800">
        졸업스냅 서비스 디어블룸 머시기 슬로건
      </p>
    </div>
  );

  const error = auth ? (
    <p className="mb-3 text-center text-caption-1 text-danger">로그인에 실패했어요. 다시 시도해 주세요.</p>
  ) : null;

  return (
    <main className="min-h-dvh bg-primary-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden">
        <div className="absolute left-1/2 top-[121px] -translate-x-1/2">{brand}</div>
        <div className="absolute inset-x-2 bottom-[88px]">
          {error}
          <SocialLoginButtons role={role} />
        </div>
      </div>
    </main>
  );
}
