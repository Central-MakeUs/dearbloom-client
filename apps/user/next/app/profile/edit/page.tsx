import { cookies } from 'next/headers';
import { getCustomerMe } from '@dearbloom/shared';
import { EditForm } from './EditForm';
import { LOGIN_HREF } from '@/src/lib/env';
import { Header as TitleHeader } from '@dearbloom/ui';

export const dynamic = 'force-dynamic';

const Header = () => <TitleHeader backHref="/app/my" title="프로필 수정하기" />;

export default async function ProfileEditPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="text-body-5 text-neutral-500">로그인이 필요해요.</p>
          <a href={LOGIN_HREF} className="rounded-md bg-primary px-5 py-2.5 text-body-5 text-neutral-0">
            로그인
          </a>
        </div>
      </div>
    );
  }

  const me = await getCustomerMe({ token }).catch(() => null);

  return (
    <div className="relative mx-auto flex min-h-screen max-w-md flex-col bg-neutral-100">
      <Header />
      <EditForm initialName={me?.name ?? ''} initialRegion={me?.region ?? ''} />
    </div>
  );
}
