import { Skeleton } from '@dearbloom/ui';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

/** 프로필 수정 — 기존 이름을 받아 채워야 폼이 뜬다. 그때까지 필드 모양만 보여준다. */
export default function ProfileEditLoading() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100" aria-busy>
      <AppBackHeader fallbackHref="/app/my" title="프로필 수정하기" />
      <div className="flex flex-1 flex-col gap-2 px-4 pt-5">
        <Skeleton className="h-5 w-16" />
        <Skeleton className="h-12 w-full" />
      </div>
      <div className="px-4 pb-6">
        <Skeleton className="h-12 w-full" />
      </div>
      <span className="sr-only">프로필을 불러오는 중이에요.</span>
    </div>
  );
}
