import type { MemberRole } from '@dearbloom/shared';

export function getOnboardingTermsPath(role: MemberRole, forceOnboarding = false) {
  const params = new URLSearchParams({ role });
  if (forceOnboarding) params.set('forceOnboarding', '1');

  return `/app/onboarding/terms?${params.toString()}`;
}

export function getOnboardingFormPath(role: MemberRole, forceOnboarding = false) {
  const path = role === 'CUSTOMER' ? '/app/onboarding' : '/app/onboarding/artist';

  return forceOnboarding ? `${path}?forceOnboarding=1` : path;
}
