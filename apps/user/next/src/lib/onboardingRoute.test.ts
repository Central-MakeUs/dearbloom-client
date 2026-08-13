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
  assert.equal(
    getOnboardingTermsPath('CUSTOMER', false, '/app/invite/XAK6PD?loginComplete=1'),
    '/app/onboarding/terms?role=CUSTOMER&returnUrl=%2Fapp%2Finvite%2FXAK6PD%3FloginComplete%3D1',
  );
  assert.equal(
    getOnboardingFormPath('CUSTOMER', false, '/app/invite/XAK6PD?loginComplete=1'),
    '/app/onboarding?returnUrl=%2Fapp%2Finvite%2FXAK6PD%3FloginComplete%3D1',
  );
});
