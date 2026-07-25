import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { ARTIST_REGION_OPTIONS } from '@dearbloom/shared';
import { BottomButton, TextField } from '@dearbloom/ui';

type ArtistOnboardingPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ArtistOnboardingPage({ searchParams }: ArtistOnboardingPageProps) {
  if (!(await cookies()).has('accessToken')) redirect('/dev/login');

  const { error } = await searchParams;
  const errorMessage = error ? (
    <p className="text-caption-1 text-danger" role="alert">
      작가 정보를 저장하지 못했습니다. 입력값을 확인해 주세요.
    </p>
  ) : null;

  const form = (
    <form action="/app/api/members/artist" className="mt-6 flex flex-col gap-6" method="post">
      <TextField
        autoComplete="name"
        id="artist-nickname"
        label="작가 이름"
        maxLength={20}
        minLength={1}
        name="nickname"
        placeholder="이름을 입력하세요"
        required
      />
      <TextField
        autoComplete="address-level1"
        id="artist-region"
        label="활동 지역"
        list="artist-region-options"
        name="region"
        placeholder="활동 지역을 입력하세요"
        required
      />
      <datalist id="artist-region-options">
        {ARTIST_REGION_OPTIONS.map((region) => (
          <option key={region.value} value={region.label} />
        ))}
      </datalist>
      {errorMessage}
      <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
        <BottomButton type="submit">다음</BottomButton>
      </div>
    </form>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        <header className="flex h-[52px] items-center px-2">
          <a
            aria-label="뒤로가기"
            className="flex h-11 w-11 items-center justify-center text-neutral-950"
            href="/app/role"
          >
            <svg
              aria-hidden
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </a>
        </header>
        <section className="px-4 pt-2">
          <div className="px-1 py-3">
            <h1 className="text-head-1 text-neutral-900">이름과 활동 지역을 입력해 주세요.</h1>
            <p className="mt-3 text-body-2 text-neutral-800">
              작가 프로필에 표시될 이름과
              <br />
              주로 활동하는 지역을 입력해 주세요.
            </p>
          </div>
          {form}
        </section>
      </div>
    </main>
  );
}
