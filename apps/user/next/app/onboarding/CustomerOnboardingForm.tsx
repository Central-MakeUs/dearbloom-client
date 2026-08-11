'use client';

import { useState, type ReactNode } from 'react';
import { Check, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ARTIST_REGION_OPTIONS, type ArtistRegionCode, type University } from '@dearbloom/shared';
import { BottomButton, cn, DeleteButton, Header, TextField } from '@dearbloom/ui';
import {
  getUniversityLabel,
  UniversitySearchScreen,
} from '@/src/components/common/UniversitySearchScreen';

type OnboardingStep = 'complete' | 'region' | 'school';

const regionLabel = (region: (typeof ARTIST_REGION_OPTIONS)[number]) =>
  region.label
    .replace('경기북부', '경기 북부')
    .replace('경기남부', '경기 남부')
    .replace('대전·세종', '대전/세종');

function StepProgress({ step }: { step: 1 | 2 }) {
  const bars = [1, 2].map((index) => (
    <span
      aria-hidden
      className={cn('h-1 flex-1 rounded-full', index <= step ? 'bg-primary-400' : 'bg-neutral-200')}
      key={index}
    />
  ));

  return (
    <div aria-label={`${step}/3 단계`} className="flex gap-1 px-4">
      {bars}
    </div>
  );
}

function StepHeader({
  onBack,
  onSkip,
  step,
}: {
  onBack: () => void;
  onSkip?: () => void;
  step: 1 | 2;
}) {
  const skipButton = onSkip ? (
    <button className="px-2 text-caption-1 text-neutral-600" onClick={onSkip} type="button">
      건너뛰기
    </button>
  ) : null;

  return (
    <div>
      <Header onBack={onBack} right={skipButton} />
      <StepProgress step={step} />
    </div>
  );
}

export function CustomerOnboardingForm({ forceOnboarding }: { forceOnboarding: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<OnboardingStep>('school');
  const [selectedUniversity, setSelectedUniversity] = useState<University>();
  const [manualUniversityName, setManualUniversityName] = useState('');
  const [isManualUniversityInputVisible, setIsManualUniversityInputVisible] = useState(false);
  const [region, setRegion] = useState<ArtistRegionCode>();
  const [isSearchingSchool, setIsSearchingSchool] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(undefined);

    if (forceOnboarding) {
      setStep('complete');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/app/api/members/customer', {
        body: JSON.stringify({
          region,
          universityId: selectedUniversity?.universityId,
          // ponytail: API는 universityId만 지원한다. 자율입력 필드는 backend 지원 시 전송한다.
        }),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      });
      const body = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(body.message ?? '고객 정보를 저장하지 못했습니다.');

      setStep('complete');
      setIsSubmitting(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '고객 정보를 저장하지 못했습니다.',
      );
      setIsSubmitting(false);
    }
  };

  if (isSearchingSchool) {
    return (
      <UniversitySearchScreen
        initialKeyword={selectedUniversity?.name ?? manualUniversityName}
        onBack={() => setIsSearchingSchool(false)}
        onManualInput={(keyword) => {
          setSelectedUniversity(undefined);
          setManualUniversityName(keyword);
          setIsManualUniversityInputVisible(true);
          setIsSearchingSchool(false);
        }}
        onSelect={(university) => {
          setSelectedUniversity(university);
          setManualUniversityName('');
          setIsManualUniversityInputVisible(false);
          setIsSearchingSchool(false);
        }}
      />
    );
  }

  const pageShell = (header: ReactNode, content: ReactNode, footer: ReactNode) => (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        {header}
        {content}
        {footer}
      </div>
    </main>
  );

  const footer = (label: string, onClick: () => void, disabled = false) => (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {error ? (
        <p className="mb-2 text-center text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <BottomButton color="black" disabled={disabled || isSubmitting} onClick={onClick}>
        {isSubmitting ? '저장 중...' : label}
      </BottomButton>
    </div>
  );

  if (step === 'school') {
    const schoolButton = (
      <div className="flex w-full flex-col gap-2">
        <span className="text-body-4 text-neutral-950">학교명 검색</span>
        <div className="flex h-14 items-center gap-2 rounded-md border border-transparent bg-neutral-0 px-4 transition-colors hover:border-primary-400 focus-within:border-primary">
          <button
            aria-label="학교명 검색 화면 열기"
            className="flex min-w-0 flex-1 items-center text-left focus:outline-none"
            onClick={() => setIsSearchingSchool(true)}
            type="button"
          >
            <span
              className={cn(
                'flex-1 text-body-6',
                selectedUniversity ? 'text-neutral-950' : 'text-neutral-500',
              )}
            >
              {selectedUniversity ? getUniversityLabel(selectedUniversity) : '학교명을 검색하세요'}
            </span>
          </button>
          {selectedUniversity ? (
            <DeleteButton onClick={() => setSelectedUniversity(undefined)} />
          ) : (
            <Search aria-hidden className="text-neutral-500" size={20} strokeWidth={1.8} />
          )}
        </div>
      </div>
    );

    const content = (
      <section className="px-4 pt-7">
        <h1 className="text-head-3 text-neutral-950">학교를 선택해 주세요.</h1>
        <p className="mt-3 text-body-6 text-neutral-700">
          학교 위치에 따라 출장비가 달라질 수 있어요.
          <br />
          학교명과 구체적인 캠퍼스명을 함께 적어 주세요.
        </p>
        <div className="mt-8 flex flex-col gap-6">
          {schoolButton}
          {isManualUniversityInputVisible ? (
            <TextField
              autoFocus
              id="manual-university-name"
              label="학교명 직접 입력"
              onChange={(event) => setManualUniversityName(event.target.value)}
              onClear={() => setManualUniversityName('')}
              placeholder="학교명과 캠퍼스명을 입력하세요"
              value={manualUniversityName}
            />
          ) : null}
        </div>
      </section>
    );

    return pageShell(
      <StepHeader onBack={() => router.back()} onSkip={() => setStep('region')} step={1} />,
      content,
      footer('다음', () => setStep('region')),
    );
  }

  if (step === 'region') {
    const regionOptions = ARTIST_REGION_OPTIONS.map((option) => (
      <button
        aria-pressed={region === option.value}
        // 선택 상태에 테두리가 없어 배경만으로는 구분이 잘 안 됐다(QA). 필터 설정 칩과 같은 규칙으로 맞춘다.
        className={cn(
          'rounded-full border-[1.2px] px-3 py-2 text-caption-1 transition-colors',
          region === option.value
            ? 'border-primary bg-primary-200 font-semibold text-primary'
            : 'border-transparent bg-neutral-200 text-neutral-700',
        )}
        key={option.value}
        onClick={() => setRegion(region === option.value ? undefined : option.value)}
        type="button"
      >
        {regionLabel(option)}
      </button>
    ));

    const content = (
      <section className="px-4 pt-7">
        <h1 className="text-head-3 text-neutral-950">촬영 희망 지역을 선택해 주세요.</h1>
        <p className="mt-3 text-body-6 text-neutral-700">
          학교 위치에 따라 출장비가 달라질 수 있어요.
          <br />
          학교명과 구체적인 캠퍼스명을 함께 적어 주세요.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">{regionOptions}</div>
      </section>
    );

    return pageShell(
      <StepHeader onBack={() => setStep('school')} onSkip={submit} step={2} />,
      content,
      footer('완료', submit),
    );
  }

  const goToSnaps = () => window.location.replace('/snaps');
  const completeActions = (
    <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(20px,env(safe-area-inset-bottom))]">
      {/* 기능이 준비되면 복원: <BottomButton onClick={goToSnaps}>기능 둘러보기</BottomButton> */}
      <button
        className="mt-3 h-10 w-full text-body-5 text-neutral-700"
        onClick={goToSnaps}
        type="button"
      >
        바로 시작하기
      </button>
    </div>
  );

  return (
    <main className="min-h-dvh bg-primary-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden">
        <section className="flex flex-col items-center px-4 pt-[18vh] text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-300 text-neutral-0">
            <Check aria-hidden size={34} strokeWidth={2.5} />
          </span>
          <h1 className="mt-6 text-head-3 text-neutral-950">모델 설정이 완료 되었어요!</h1>
          <p className="mt-2 text-body-6 text-neutral-700">
            취향에 맞는 작품을 탐색하고
            <br />
            작가님께 문의해 보세요.
          </p>
        </section>
        {completeActions}
      </div>
    </main>
  );
}
