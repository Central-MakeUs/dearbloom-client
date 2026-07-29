import { cookies } from 'next/headers';
import { getMyArtworks, type MyArtworkListItem } from '@dearbloom/shared';
import { Plus } from 'lucide-react';
import { Button } from '@dearbloom/ui';
import { MyArtworkList } from './MyArtworkList';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

export default async function ArtistProductsPage() {
  const token = (await cookies()).get('accessToken')?.value;

  let items: MyArtworkListItem[] = [];
  let needLogin = false;
  if (!token) {
    needLogin = true;
  } else {
    items = await getMyArtworks({ token }).catch(() => []);
  }

  const header = (
    <header className="flex items-center justify-between px-4 pt-6">
      <h1 className="text-head-2 text-neutral-950">내 작품</h1>
      {!needLogin && items.length > 0 && (
        <Button asChild size="sm">
          <a href="/app/artist/products/new">
            <Plus className="size-4" /> 작품 등록
          </a>
        </Button>
      )}
    </header>
  );

  const body = needLogin ? (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-5 text-neutral-500">작가 계정으로 로그인해주세요.</p>
      <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">로그인</a>
    </div>
  ) : items.length === 0 ? (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-body-5 text-neutral-500">아직 등록한 작품이 없어요.</p>
      <a href="/app/artist/products/new" className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">첫 작품 등록하기</a>
    </div>
  ) : (
    <MyArtworkList items={items} />
  );

  return (
    <div className="mx-auto max-w-md pb-10">
      {header}
      {body}
    </div>
  );
}
