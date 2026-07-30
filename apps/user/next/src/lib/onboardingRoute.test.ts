import assert from 'node:assert/strict';
import test from 'node:test';

import { getOnboardingFormPath, getOnboardingTermsPath } from './onboardingRoute.ts';

test('역할과 forceOnboarding을 온보딩 경로에 보존한다', () => {
  assert.equal(getOnboardingTermsPath('CUSTOMER'), '/app/onboarding/terms?role=CUSTOMER');
  assert.equal(
    getOnboardingTermsPath('ARTIST', true),
    '/app/onboarding/terms?role=ARTIST&forceOnboarding=1',
  );
  assert.equal(getOnboardingFormPath('CUSTOMER'), '/app/onboarding');
  assert.equal(getOnboardingFormPath('ARTIST', true), '/app/onboarding/artist?forceOnboarding=1');
});
