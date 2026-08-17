import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getOnboardingFormPath,
  getOnboardingTermsPath,
  isOnboardingPagePath,
  shouldCancelPendingOnboarding,
} from './onboardingRoute.ts';

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

test('온보딩 페이지 경로만 구분한다', () => {
  assert.equal(isOnboardingPagePath('/app/onboarding/artist'), true);
  assert.equal(isOnboardingPagePath('/app/onboarding/terms'), true);
  assert.equal(isOnboardingPagePath('/app/onboarding-preview'), false);
  assert.equal(isOnboardingPagePath('/snaps'), false);
});

test('pending session은 실제 비온보딩 페이지 이동에서만 취소한다', () => {
  const documentHeaders = new Headers({ 'sec-fetch-dest': 'document' });
  const apiHeaders = new Headers({ accept: 'application/json' });
  const imageHeaders = new Headers({ 'sec-fetch-dest': 'image' });
  const rscHeaders = new Headers({ accept: 'text/x-component' });

  assert.equal(shouldCancelPendingOnboarding('/app/onboarding/terms', documentHeaders), false);
  assert.equal(shouldCancelPendingOnboarding('/app/onboarding/artist', documentHeaders), false);
  assert.equal(shouldCancelPendingOnboarding('/app/api/universities', apiHeaders), false);
  assert.equal(shouldCancelPendingOnboarding('/app/icon.png', imageHeaders), false);
  assert.equal(shouldCancelPendingOnboarding('/app/my', rscHeaders), false);
  assert.equal(shouldCancelPendingOnboarding('/snaps', documentHeaders), true);
  assert.equal(shouldCancelPendingOnboarding('/app/my', documentHeaders), true);
});
