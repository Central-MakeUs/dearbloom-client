import { cookies } from 'next/headers';
import { getInquiryPreparation } from '@dearbloom/shared';
import { Header } from '@dearbloom/ui';
import { LoginRequired } from '../../(auth)/LoginRequired';
import { SmartInquiryForm } from './SmartInquiryForm';

export const dynamic = 'force-dynamic';

const Shell = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-md">
    <Header title="스마트 문의하기" showBack={false} />
    {children}
  </div>
);

export default async function NewInquiryPage({
  searchParams,
}: {
  searchParams: Promise<{ artworkPackageId?: string }>;
}) {
  const { artworkPackageId } = await searchParams;
  const token = (await cookies()).get('accessToken')?.value;

  if (!token) {
    const returnUrl = `/app/inquiries/new?artworkPackageId=${artworkPackageId ?? ''}`;
    return (
      <Shell>
        <LoginRequired
          description="로그인하고 작가님께 문의를 시작해 보세요."
          returnUrl={returnUrl}
        />
      </Shell>
    );
  }

  const preparation = artworkPackageId
    ? await getInquiryPreparation(artworkPackageId, { token }).catch(() => null)
    : null;

  if (!preparation) {
    return (
      <Shell>
        <p className="px-6 py-16 text-center text-body-5 text-neutral-500">
          문의 정보를 불러오지 못했어요. 작품 상세에서 패키지를 다시 선택해 주세요.
        </p>
      </Shell>
    );
  }

  return <SmartInquiryForm preparation={preparation} />;
}
