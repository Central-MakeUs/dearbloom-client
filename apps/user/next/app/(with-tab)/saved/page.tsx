import { cookies } from 'next/headers';
import { getSavedArtworks, type ArtworkListItem } from '@dearbloom/shared';
import { SavedView } from './SavedView';
import { LOGIN_HREF } from '@/src/lib/env';

export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const cookieStore = await cookies();
  const token = cookieStore.has('onboardingPending')
    ? undefined
    : cookieStore.get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto max-w-md">
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <p className="text-body-4 text-neutral-500">로그인하면 저장한 작품을 볼 수 있어요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-4 text-neutral-0">
            로그인
          </a>
        </div>
      </div>
    );
  }

  const items: ArtworkListItem[] = await getSavedArtworks({ token }).catch(() => []);

  return <SavedView initialItems={items} />;
}
