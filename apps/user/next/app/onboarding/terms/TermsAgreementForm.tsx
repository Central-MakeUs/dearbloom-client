'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import type { MemberRole } from '@dearbloom/shared';
import { BottomButton, Header } from '@dearbloom/ui';

import { getOnboardingFormPath } from '@/src/lib/onboardingRoute';

export function TermsAgreementForm({
  forceOnboarding,
  role,
}: {
  forceOnboarding: boolean;
  role: MemberRole;
}) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [ageAgreed, setAgeAgreed] = useState(false);
  const allAgreed = privacyAgreed && ageAgreed;

  const agreementRow = (
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    details: ReactNode,
  ) => (
    <div className="border-b border-neutral-200 py-4">
      <label className="flex cursor-pointer items-center gap-3 text-body-4 text-neutral-950">
        <input
          checked={checked}
          className="h-5 w-5 accent-primary"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span>{label}</span>
      </label>
      <details className="group ml-8 mt-3 text-caption-2 text-neutral-600">
        <summary className="flex cursor-pointer list-none items-center justify-between py-1">
          자세히 보기
          <ChevronDown
            aria-hidden
            className="transition-transform group-open:rotate-180"
            size={18}
          />
        </summary>
        <div className="mt-2 rounded-md bg-neutral-200 p-4 leading-relaxed">{details}</div>
      </details>
    </div>
  );

  const privacyDetails = (
    <div className="space-y-3">
      <p>
        소셜 로그인 정보, 프로필 정보, 서비스 이용 기록과 기기·접속 정보를 회원 식별, 고객–작가
        매칭, 예약·채팅 제공 및 서비스 안정성 확보 목적으로 처리합니다.
      </p>
      <p>
        회원 정보는 회원 탈퇴 시까지 보관하며, 관계 법령에 따라 일부 기록은 정해진 기간 동안 보관할
        수 있습니다.
      </p>
      <a
        className="inline-block text-primary underline"
        href="/privacy-policy"
        rel="noreferrer"
        target="_blank"
      >
        개인정보 처리방침 전문 보기
      </a>
    </div>
  );

  const ageDetails = (
    <p>
      디어블룸은 원칙적으로 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만 14세 미만이면
      서비스를 이용할 수 없습니다.
    </p>
  );

  const agreements = (
    <div className="mt-8">
      <label className="flex cursor-pointer items-center gap-3 rounded-md bg-primary-100 px-4 py-4 text-body-4 font-semibold text-neutral-950">
        <input
          checked={allAgreed}
          className="h-5 w-5 accent-primary"
          onChange={(event) => {
            setPrivacyAgreed(event.target.checked);
            setAgeAgreed(event.target.checked);
          }}
          type="checkbox"
        />
        모두 동의합니다
      </label>
      {agreementRow(
        '[필수] 개인정보 수집 및 이용 동의',
        privacyAgreed,
        setPrivacyAgreed,
        privacyDetails,
      )}
      {agreementRow('[필수] 만 14세 이상입니다', ageAgreed, setAgeAgreed, ageDetails)}
    </div>
  );

  const footer = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton
        color="black"
        disabled={!allAgreed}
        onClick={() => window.location.assign(getOnboardingFormPath(role, forceOnboarding))}
      >
        동의하고 계속하기
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        <Header onBack={() => window.location.replace('/app/role')} />
        <section className="px-4 pt-7">
          <h1 className="text-head-3 text-neutral-950">서비스 이용을 위해 동의해 주세요.</h1>
          <p className="mt-3 text-body-6 text-neutral-700">
            개인정보를 입력하기 전에 필수 내용을 확인해 주세요.
          </p>
          {agreements}
        </section>
        {footer}
      </div>
    </main>
  );
}
