import type { MemberRole } from '@dearbloom/shared';

export function getOnboardingTermsPath(
  role: MemberRole,
  forceOnboarding = false,
  returnUrl?: string,
) {
  const params = new URLSearchParams({ role });
  if (forceOnboarding) params.set('forceOnboarding', '1');
  if (returnUrl) params.set('returnUrl', returnUrl);

  return `/app/onboarding/terms?${params.toString()}`;
}

export function getOnboardingFormPath(
  role: MemberRole,
  forceOnboarding = false,
  returnUrl?: string,
) {
  const path = role === 'CUSTOMER' ? '/app/onboarding' : '/app/onboarding/artist';
  const params = new URLSearchParams();
  if (forceOnboarding) params.set('forceOnboarding', '1');
  if (returnUrl) params.set('returnUrl', returnUrl);
  const query = params.toString();

  return query ? `${path}?${query}` : path;
}

export function isOnboardingRequestPath(pathname: string) {
  const path = pathname.replace(/^\/app(?=\/|$)/, '');

  return (
    path === '/onboarding' ||
    path.startsWith('/onboarding/') ||
    path === '/api/members/customer' ||
    path === '/api/members/artist' ||
    path === '/api/artist/presigned' ||
    path === '/api/auth/cancel-onboarding'
  );
}
