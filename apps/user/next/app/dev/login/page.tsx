import { cookies } from 'next/headers';
import { getDevAccounts, type DevAccount, type DevRole } from '@dearbloom/shared';

export const dynamic = 'force-dynamic';

type JwtPayload = { memberId?: number; activeRole?: string; sub?: string };

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

export default async function DevLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ ok?: string; error?: string }>;
}) {
  const params = await searchParams;
  const [accounts, cookieStore] = await Promise.all([
    getDevAccounts().catch(() => [] as DevAccount[]),
    cookies(),
  ]);
  const token = cookieStore.get('accessToken')?.value;
  const current = token ? decodeJwt(token) : null;

  const roleBadges = (a: DevAccount) => {
    const badges = [];
    if (a.hasArtist) badges.push({ label: '작가', cls: 'bg-primary-100 text-primary' });
    if (a.hasCustomer) badges.push({ label: '고객', cls: 'bg-neutral-200 text-neutral-700' });
    if (badges.length === 0) badges.push({ label: '미온보딩', cls: 'bg-neutral-100 text-neutral-500' });
    return badges;
  };

  // 계정이 가진 역할에 맞춰 로그인 버튼 구성. 선택한 역할로 로그인 후 해당 화면으로 이동.
  const loginRoles = (a: DevAccount): { role: DevRole; label: string; cls: string }[] => {
    const roles: { role: DevRole; label: string; cls: string }[] = [];
    if (a.hasArtist) roles.push({ role: 'ARTIST', label: '작가로 로그인', cls: 'bg-primary text-neutral-0' });
    if (a.hasCustomer) roles.push({ role: 'CUSTOMER', label: '고객으로 로그인', cls: 'bg-neutral-800 text-neutral-0' });
    if (roles.length === 0) roles.push({ role: 'ONBOARDING', label: '온보딩 로그인', cls: 'bg-neutral-200 text-neutral-800' });
    return roles;
  };

  const status = (
    <div className="mb-5 rounded-lg border border-neutral-200 bg-neutral-0 p-4">
      <p className="text-caption-1 text-neutral-500">현재 로그인</p>
      {current ? (
        <p className="mt-1 text-body-4 text-neutral-950">
          memberId {current.memberId} · {current.activeRole} · {current.sub}
        </p>
      ) : (
        <p className="mt-1 text-body-5 text-neutral-500">로그인 안 됨</p>
      )}
      {params?.ok && <p className="mt-2 text-caption-1 text-success">로그인되었습니다.</p>}
      {params?.error && <p className="mt-2 text-caption-1 text-danger">로그인 실패: {params.error}</p>}
      <a href="/app/api/auth/logout" className="mt-3 inline-block text-caption-1 text-neutral-500 underline">
        로그아웃
      </a>
    </div>
  );

  const list = (
    <ul className="flex flex-col gap-2">
      {accounts.map((a) => (
        <li
          key={a.memberId}
          className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-3"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-body-4 text-neutral-950">{a.name}</span>
              {roleBadges(a).map((b) => (
                <span key={b.label} className={`rounded-sm px-1.5 py-0.5 text-caption-3 ${b.cls}`}>
                  {b.label}
                </span>
              ))}
            </div>
            <div className="truncate text-caption-2 text-neutral-500">
              {a.email} · id {a.memberId}
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-1.5">
            {loginRoles(a).map(({ role, label, cls }) => (
              <form key={role} action="/app/api/dev/login" method="post">
                <input type="hidden" name="memberId" value={a.memberId} />
                <input type="hidden" name="role" value={role} />
                <button
                  type="submit"
                  className={`w-full whitespace-nowrap rounded-md px-3 py-2 text-caption-1 font-medium ${cls}`}
                >
                  {label}
                </button>
              </form>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="text-head-2 text-neutral-950">개발용 로그인</h1>
      <p className="mt-1 text-caption-1 text-neutral-600">
        테스트 계정으로 로그인합니다. 작가 기능 테스트는 <b>작가</b> 계정을 선택하세요.
      </p>
      <div className="mt-5">
        {status}
        {accounts.length === 0 ? (
          <p className="text-body-5 text-neutral-500">계정을 불러오지 못했어요.</p>
        ) : (
          list
        )}
      </div>
    </main>
  );
}
