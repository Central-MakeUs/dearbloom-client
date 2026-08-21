import { cookies } from 'next/headers';
import { getCustomerMe } from '@dearbloom/shared';
import { EditForm } from './EditForm';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { AppBackHeader } from '@/src/components/common/AppBackHeader';

export const dynamic = 'force-dynamic';

const Header = () => <AppBackHeader fallbackHref="/app/my" title="프로필 수정하기" />;

export default async function ProfileEditPage() {
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    return (
      <main className="min-h-screen bg-neutral-100">
        <div className="mx-auto flex min-h-screen max-w-md flex-col">
          <Header />
          <LoginRequired className="flex-1 justify-center py-0" returnUrl="/app/profile/edit" />
        </div>
      </main>
    );
  }

  const me = await getCustomerMe({ token }).catch(() => null);

  return (
    <main className="min-h-screen bg-neutral-100">
      <div className="relative mx-auto flex min-h-screen max-w-md flex-col">
        <Header />
        <EditForm
          initialName={me?.name ?? ''}
          initialRegion={me?.region ?? null}
          initialUniversity={
            me?.universityId && me.universityName
              ? { universityId: me.universityId, name: me.universityName }
              : null
          }
        />
      </div>
    </main>
  );
}
