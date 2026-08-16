import { Header, Skeleton } from '@dearbloom/ui';

/** 작가 프로필 — 기존 값(닉네임·소개·지역·기타)을 받아 채우는 폼이라 필드 모양만 먼저 둔다. */
export default function ArtistProfileLoading() {
  return (
    <div className="mx-auto max-w-md" aria-busy>
      <Header backHref="/app/artist/products" title="작가 프로필" />
      <div className="flex flex-col gap-5 px-4 pt-5">
        {[
          { label: 'w-16', input: 'h-12' },
          { label: 'w-20', input: 'h-24' },
          { label: 'w-20', input: 'h-12' },
          { label: 'w-16', input: 'h-24' },
        ].map((f, i) => (
          <div key={i} className="flex flex-col gap-2">
            <Skeleton className={`h-5 ${f.label}`} />
            <Skeleton className={`${f.input} w-full`} />
          </div>
        ))}
        <Skeleton className="mt-2 h-12 w-full" />
      </div>
      <span className="sr-only">작가 프로필을 불러오는 중이에요.</span>
    </div>
  );
}
