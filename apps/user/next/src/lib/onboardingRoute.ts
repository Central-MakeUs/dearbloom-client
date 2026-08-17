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

export function isOnboardingPagePath(pathname: string) {
  const path = pathname.replace(/^\/app(?=\/|$)/, '');

  return path === '/onboarding' || path.startsWith('/onboarding/');
}

export function shouldCancelPendingOnboarding(pathname: string, headers: Headers) {
  const isPageNavigation =
    headers.get('sec-fetch-mode') === 'navigate' ||
    headers.get('sec-fetch-dest') === 'document' ||
    headers.get('accept')?.includes('text/html');

  return Boolean(isPageNavigation) && !isOnboardingPagePath(pathname);
}
