import { Header, Skeleton } from '@dearbloom/ui';
import { MemberLogoutButton } from '@/src/components/common/MemberLogoutButton';
import { MyMenuRow } from '@/src/components/common/MyMenuRow';

/**
 * 작가 마이페이지 자리표시자.
 * 서버에서 기다리는 건 프로필(이름·이메일·이미지)뿐이라 메뉴는 실제로 그린다.
 */
export default function ArtistMyLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header showBack={false} title="마이페이지" />

      <section className="flex items-center justify-between px-4 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <Skeleton className="size-12 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-7 w-12 shrink-0" />
      </section>

      <nav className="mt-5 flex flex-col gap-1 px-5">
        <MyMenuRow label="개인정보 처리방침" href="/privacy-policy" />
        <MemberLogoutButton />
        <MyMenuRow label="탈퇴하기" href="/app/my/withdraw?from=artist" />
      </nav>
      <span className="sr-only">내 정보를 불러오는 중이에요.</span>
    </div>
  );
}
