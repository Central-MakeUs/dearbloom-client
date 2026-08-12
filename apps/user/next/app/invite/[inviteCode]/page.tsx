import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button, Header } from '@dearbloom/ui';
import {
  fetchPublicWithAuthFallback,
  getSharedBoardInvite,
  type SharedBoardInvite,
} from '@dearbloom/shared';
import { getInviteView } from './inviteView';
import { JoinBoardButton } from './JoinBoardButton';

export const dynamic = 'force-dynamic';

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ inviteCode: string }>;
  searchParams: Promise<{ loginComplete?: string }>;
}) {
  const { inviteCode } = await params;
  const { loginComplete } = await searchParams;
  const token = (await cookies()).get('accessToken')?.value;
  const result = await fetchPublicWithAuthFallback(
    (opts) => getSharedBoardInvite(inviteCode, opts),
    token,
  ).catch(() => undefined);
  const invite: SharedBoardInvite | undefined = result?.data;
  const authenticated = !!token && !result?.tokenExpired;
  const view = getInviteView(authenticated, loginComplete);

  if (invite?.alreadyJoined && view === 'member') redirect(`/boards/${invite.sharedBoardId}`);

  if (!invite) {
    return (
      <main className="mx-auto min-h-dvh max-w-md bg-neutral-100">
        <Header showBack backHref="/app/saved?tab=board" title="공동보드 초대" />
        <p className="px-6 py-24 text-center text-body-4 text-neutral-600">
          유효하지 않은 초대 링크예요.
        </p>
      </main>
    );
  }

  const appBanner = (
    <meta
      content={`app-id=6792470769, app-argument=dearbloom://invite/${encodeURIComponent(inviteCode)}`}
      name="apple-itunes-app"
    />
  );

  if (view === 'login-complete') {
    return (
      <>
        {appBanner}
        <meta content="rgb(229 235 232)" name="theme-color" />
        <main className="min-h-dvh bg-primary-100">
          <div className="mx-auto flex min-h-dvh max-w-[375px] flex-col overflow-hidden">
            <section className="flex flex-col items-center px-4 pt-[113px] text-center">
              <img
                alt=""
                className="size-[72px]"
                height={72}
                src="/app/images/invite-login-complete.svg"
                width={72}
              />
              <h1 className="mt-6 text-head-1 text-neutral-900">로그인이 완료 되었어요!</h1>
              <p className="mt-2 text-body-2 text-neutral-800">
                취향에 맞는 작품을 탐색하고
                <br />
                작가님께 문의해 보세요.
              </p>
            </section>
            <div className="mt-auto px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
              <JoinBoardButton
                inviteCode={inviteCode}
                joinedBoardId={invite.alreadyJoined ? invite.sharedBoardId : undefined}
              />
              <a
                className="mt-3 flex h-10 items-center justify-center text-body-1 text-neutral-800"
                href="/snaps"
              >
                기능 둘러보기
              </a>
            </div>
          </div>
        </main>
      </>
    );
  }

  const action = view === 'member' ? (
    <JoinBoardButton inviteCode={inviteCode} />
  ) : (
    <Button asChild className="h-[52px] w-full rounded-md text-body-1">
      <a
        href={`/app/login?returnUrl=${encodeURIComponent(`/app/invite/${inviteCode}?loginComplete=1`)}`}
      >
        로그인 하러 가기
      </a>
    </Button>
  );

  return (
    <>
      {appBanner}
      <meta content="rgb(238 243 240)" name="theme-color" />
      <main className="min-h-dvh bg-primary-50">
        <div className="mx-auto flex min-h-dvh max-w-[375px] flex-col overflow-hidden">
          <section className="flex flex-col items-center px-4 pt-14 text-center">
            <h1 className="w-64 text-[22px] font-bold leading-[1.4] tracking-[-0.005em] text-neutral-900">
              <span className="text-primary">{invite.ownerName}</span>님의
              <br />
              공동보드에 초대되었어요
            </h1>
            <p className="mt-3 w-[229px] text-body-1 text-neutral-700">
              친구들과 함께 졸업스냅 작품 후보를 모으고 의견을 나눠 보세요.
            </p>
            <div className="mt-9 max-w-full rounded-[6px] bg-neutral-0 px-3 py-1.5 text-body-5 text-neutral-800">
              <p className="max-w-[280px] truncate">{invite.boardName}</p>
            </div>
            <img
              alt=""
              className="mt-14 h-[180px] w-[166px]"
              height={180}
              src="/app/images/shared-board-invite.svg"
              width={166}
            />
          </section>
          <div className="mt-auto">
            {view === 'guest' ? (
              <p className="px-4 pb-3 text-center text-body-5 text-neutral-600">
                공동보드 참여를 위해 로그인이 필요해요.
              </p>
            ) : null}
            <div className="bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
              {action}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
