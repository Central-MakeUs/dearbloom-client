import { Header, Skeleton } from '@dearbloom/ui';
import { DefaultAvatar } from '@/src/components/common/DefaultAvatar';
import { MyMenu } from './MyMenu';

/**
 * 마이페이지 자리표시자.
 * 서버에서 기다리는 건 이름·이메일뿐이라 나머지(아바타·메뉴)는 실제로 그린다 —
 * 응답이 와도 레이아웃이 흔들리지 않는다.
 */
export default function MyLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header showBack={false} title="마이페이지" />

      <section className="flex items-center justify-between px-4 pt-5">
        <div className="flex min-w-0 items-center gap-3">
          <DefaultAvatar />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-7 w-12 shrink-0" />
      </section>

      <MyMenu />
      <span className="sr-only">내 정보를 불러오는 중이에요.</span>
    </div>
  );
}
