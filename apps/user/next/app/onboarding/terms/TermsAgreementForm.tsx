'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

import type { MemberRole } from '@dearbloom/shared';
import { BottomButton, Checkbox, cn } from '@dearbloom/ui';

import { AppBackHeader } from '@/src/components/common/AppBackHeader';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';
import { getOnboardingFormPath } from '@/src/lib/onboardingRoute';

export function TermsAgreementForm({
  forceOnboarding,
  returnUrl,
  role,
}: {
  forceOnboarding: boolean;
  returnUrl?: string;
  role: MemberRole;
}) {
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [ageAgreed, setAgeAgreed] = useState(false);
  const [privacyExpanded, setPrivacyExpanded] = useState(false);
  const [ageExpanded, setAgeExpanded] = useState(false);
  const allAgreed = privacyAgreed && ageAgreed;

  const agreementRow = (
    id: string,
    label: string,
    checked: boolean,
    onChange: (checked: boolean) => void,
    expanded: boolean,
    onToggle: () => void,
    details: ReactNode,
  ) => (
    <div>
      <div className="flex h-11 items-center justify-between pl-[17px] pr-1">
        <div className="flex items-center gap-3 text-body-5 text-neutral-800">
          <Checkbox
            aria-label={label}
            checked={checked}
            className="relative size-6 rounded-[6px] border-[1.5px] before:absolute before:-inset-2.5 before:content-['']"
            onCheckedChange={(value) => onChange(value === true)}
          />
          <span>{label}</span>
        </div>
        <button
          aria-controls={`${id}-details`}
          aria-expanded={expanded}
          aria-label={`${label} 상세 내용 ${expanded ? '접기' : '펼치기'}`}
          className="-mr-2.5 flex size-11 items-center justify-center text-neutral-700"
          onClick={onToggle}
          type="button"
        >
          <ChevronDown
            aria-hidden
            className={cn('transition-transform', expanded && 'rotate-180')}
            size={16}
          />
        </button>
      </div>
      {expanded ? (
        <div
          className="mb-2 ml-[49px] mr-1 mt-0.5 rounded-md bg-neutral-200 px-4 py-3 text-caption-3 text-neutral-700"
          id={`${id}-details`}
        >
          {details}
        </div>
      ) : null}
    </div>
  );

  const privacyDetails = (
    <div className="min-h-[133px] space-y-3">
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
    <p className="min-h-[59px]">
      디어블룸은 원칙적으로 만 14세 미만 아동의 개인정보를 수집하지 않습니다. 만 14세 미만이면
      서비스를 이용할 수 없습니다.
    </p>
  );

  const agreements = (
    <div className="-mx-1 mt-6">
      <div className="flex h-[52px] items-center gap-3 rounded-md bg-primary-100 px-[17px] text-body-5 text-neutral-900">
        <Checkbox
          aria-label="모두 동의합니다"
          checked={allAgreed}
          className="relative size-6 rounded-[6px] border-[1.5px] before:absolute before:-inset-2.5 before:content-['']"
          onCheckedChange={(value) => {
            const checked = value === true;
            setPrivacyAgreed(checked);
            setAgeAgreed(checked);
          }}
        />
        모두 동의합니다
      </div>
      <div className="mt-[10px]">
        {agreementRow(
          'privacy-agreement',
          '[필수] 개인정보 수집 및 이용 동의',
          privacyAgreed,
          setPrivacyAgreed,
          privacyExpanded,
          () => setPrivacyExpanded((expanded) => !expanded),
          privacyDetails,
        )}
        {agreementRow(
          'age-agreement',
          '[필수] 만 14세 이상입니다',
          ageAgreed,
          setAgeAgreed,
          ageExpanded,
          () => setAgeExpanded((expanded) => !expanded),
          ageDetails,
        )}
      </div>
    </div>
  );

  const footer = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton
        color="black"
        disabled={!allAgreed}
        onClick={() =>
          window.location.assign(getOnboardingFormPath(role, forceOnboarding, returnUrl))
        }
      >
        다음
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        <AppBackHeader fallbackHref="/app/api/auth/cancel-onboarding" />
        <OnboardingProgress step={1} total={role === 'CUSTOMER' ? 3 : 2} />
        <section className="px-5 pt-4">
          <div className="py-3">
            <h1 className="text-head-1 text-neutral-900">서비스 이용을 위해 동의해 주세요.</h1>
            <p className="mt-2 w-[292px] text-body-2 text-neutral-800">
              개인정보를 입력하기 전에 서비스 이용을 위한 필수 내용을 확인해 주세요.
            </p>
          </div>
          {agreements}
        </section>
        {footer}
      </div>
    </main>
  );
}
