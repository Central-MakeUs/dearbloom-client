import Image from 'next/image';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getMemberMe } from '@dearbloom/shared';

import { shouldForceOnboarding } from '@/src/lib/forceOnboarding';
import { safeReturnUrl } from '@/src/lib/returnUrl';
import { DEV_LOGIN_ENABLED } from '@/src/lib/env';
import { getMemberHome } from '@/src/lib/memberHome';

import { LoginCloseButton } from '../LoginCloseButton';
import { SocialLoginButtons } from '../SocialLoginButtons';

type LoginPageProps = {
  searchParams: Promise<{ auth?: string; forceOnboarding?: string; returnUrl?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const {
    auth,
    forceOnboarding: forceOnboardingParam,
    returnUrl: returnUrlParam,
  } = await searchParams;
  const forceOnboarding = shouldForceOnboarding(forceOnboardingParam);
  const returnUrl = safeReturnUrl(returnUrlParam);

  // 온보딩까지 끝난 사용자가 (예: 복귀한 작품에서 뒤로가기로) 로그인 페이지에 오면
  // 빈 로그인 화면 대신 홈(astro 탐색)으로 보낸다 → 뒤로가기 흐름이 자연스러워진다.
  // 주의: next redirect('/snaps')는 basePath('/app')가 붙어 '/app/snaps'(404)가 되므로,
  //       basePath 밖의 astro 경로로 보내려면 절대 URL을 써야 한다.
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const member = !auth && token ? await getMemberMe({ token }).catch(() => undefined) : undefined;
  if (member?.hasCustomer || member?.hasArtist) {
    const h = await headers();
    const host = h.get('x-forwarded-host') ?? h.get('host') ?? '';
    const proto = h.get('x-forwarded-proto') ?? 'https';
    // 보던 화면이 있으면 그리로 되돌린다. 역할 홈으로 보내면 작가 계정이 탐색에서 저장을 눌렀을 때
    // 엉뚱하게 작가 대시보드로 튄다(hasArtist && !hasCustomer 는 항상 작가 홈이라서).
    const destination = returnUrl ?? getMemberHome(cookieStore.get('activeRole')?.value, member);
    redirect(`${proto}://${host}${destination}`);
  }

  const brand = (
    <div className="flex flex-col items-center">
      <div aria-label="DearBloom" className="relative h-[70px] w-[252px]" role="img">
        <div className="absolute left-1/2 top-1/2 h-[30.988px] w-[219px] -translate-x-1/2 -translate-y-1/2">
          <Image
            alt=""
            className="absolute left-0 top-[2.98px] h-[24.588px] w-[81.683px]"
            height={25}
            priority
            src="/app/images/dearbloom-wordmark-dear.svg"
            width={82}
          />
          <Image
            alt=""
            className="absolute left-[80.61px] top-[2.98px] h-[24.559px] w-[104.841px]"
            height={25}
            priority
            src="/app/images/dearbloom-wordmark-bloom.svg"
            width={105}
          />
          <Image
            alt=""
            className="absolute left-[188.57px] top-0 h-[30.988px] w-[30.431px]"
            height={31}
            priority
            src="/app/images/dearbloom-symbol.svg"
            width={30}
          />
        </div>
      </div>
      <p className="w-[252px] text-center text-body-2 text-neutral-800">
        졸업스냅 작가 탐색부터 예약까지
        <br />
        하나의 흐름으로
      </p>
    </div>
  );

  const error = auth ? (
    <p className="mb-3 text-center text-caption-1 text-danger">
      로그인에 실패했어요. 다시 시도해 주세요.
    </p>
  ) : null;

  return (
    <>
      <meta content="rgb(229 235 232)" name="theme-color" />
      <main className="min-h-dvh bg-primary-100">
        <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden">
          {/* 로그인은 보던 화면 위에 얹히는 단계라 항상 닫고 나갈 길을 둔다. */}
          <LoginCloseButton fallbackHref={returnUrl ?? '/snaps'} />
          <div className="absolute left-1/2 top-[121px] -translate-x-1/2">{brand}</div>
          <div className="absolute inset-x-2 bottom-[88px]">
            {error}
            <SocialLoginButtons forceOnboarding={forceOnboarding} returnUrl={returnUrl} />
            {DEV_LOGIN_ENABLED && (
              <a
                href="/app/dev/login"
                className="mt-3 block text-center text-caption-1 text-neutral-500 underline"
              >
                개발용 로그인
              </a>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
