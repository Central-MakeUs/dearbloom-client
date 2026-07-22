import { cookies } from 'next/headers';
import { ArtworkForm } from './ArtworkForm';

export const dynamic = 'force-dynamic';

export default async function NewArtworkPage() {
  const token = (await cookies()).get('accessToken')?.value;

  const header = (
    <header className="flex h-[52px] items-center gap-2 border-b border-neutral-200 bg-neutral-0 px-2">
      <a href="/app/artist/products" aria-label="뒤로가기" className="flex h-11 w-11 items-center justify-center text-neutral-950">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m15 18-6-6 6-6" /></svg>
      </a>
      <h1 className="text-head-3 text-neutral-950">작품 등록</h1>
    </header>
  );

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        {header}
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해야 등록할 수 있어요.</p>
          <a href="/app/dev/login" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {header}
      <ArtworkForm />
    </div>
  );
}
