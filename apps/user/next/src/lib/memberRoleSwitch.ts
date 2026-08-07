import type { MemberRole } from '@dearbloom/shared';

type Fetcher = (input: string, init: RequestInit) => Promise<Response>;

export async function requestMemberRoleSwitch(
  role: MemberRole,
  fetcher: Fetcher = fetch,
) {
  const response = await fetcher('/app/api/members/role', {
    body: JSON.stringify({ role }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
  });
  const body = (await response.json()) as { destination?: string; message?: string };

  if (!response.ok || !body.destination) {
    throw new Error(body.message ?? '역할을 전환하지 못했습니다.');
  }

  return body.destination;
}
