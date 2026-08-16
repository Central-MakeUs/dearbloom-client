'use client';

import Image, { type StaticImageData } from 'next/image';
import { useEffect, useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { ARTIST_REGION_OPTIONS, type ArtistRegionCode, type University } from '@dearbloom/shared';
import { BottomButton, cn, DeleteButton, Header, TextField } from '@dearbloom/ui';
import {
  getUniversityLabel,
  UniversitySearchScreen,
} from '@/src/components/common/UniversitySearchScreen';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';
import completeIcon from '../../public/images/onboarding-complete.svg';
import { withFlashToast } from '@/src/lib/flashToast';
import boardTourImage from '../../public/images/onboarding-tour-board.png';
import exploreTourImage from '../../public/images/onboarding-tour-explore.png';
import inquiryTourImage from '../../public/images/onboarding-tour-inquiry.png';

type OnboardingStep = 'complete' | 'region' | 'school' | 'tour';

const tourSlides: Array<{ description: string; image: StaticImageData; title: string }> = [
  {
    description: '취향에 맞는 졸업 스냅 작품을 쉽게 탐색할 수 있어요.',
    image: exploreTourImage,
    title: '졸업스냅 작품 탐색',
  },
  {
    description: '번거로운 프로세스 대신 빠르고 간편한 문의가 가능해요.',
    image: inquiryTourImage,
    title: '쉽고 빠른 스마트문의',
  },
  {
    description: '친구와 함께 작품 후보를 모으고 의견을 나눌 수 있어요.',
    image: boardTourImage,
    title: '친구들과 함께하는 공동보드',
  },
];

function OnboardingComplete({
  onExploreFeatures,
}: {
  onExploreFeatures: () => void;
}) {
  const actions = (
    <div className="absolute inset-x-0 bottom-0 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton color="green" onClick={onExploreFeatures}>
        기능 둘러보기
      </BottomButton>
    </div>
  );

  return (
    <main className="min-h-dvh bg-primary-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden">
        <section className="flex flex-col items-center px-4 pt-[160px] text-center">
          <Image alt="" className="size-[72px]" priority src={completeIcon} />
          <div className="mt-6 flex w-[185px] flex-col items-center gap-2">
            <h1 className="text-head-1 text-neutral-900">로그인이 완료되었어요!</h1>
            <p className="text-body-2 text-neutral-800">
              취향에 맞는 작품을 탐색하고 작가님께 문의해 보세요.
            </p>
          </div>
        </section>
        {actions}
      </div>
    </main>
  );
}

function OnboardingTour({ onFinish }: { onFinish: () => void }) {
  const [slideIndex, setSlideIndex] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;

      event.preventDefault();
      setSlideIndex((current) =>
        Math.max(
          0,
          Math.min(tourSlides.length - 1, current + (event.key === 'ArrowRight' ? 1 : -1)),
        ),
      );
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const moveTo = (index: number) => {
    setSlideIndex(Math.max(0, Math.min(tourSlides.length - 1, index)));
  };

  const startSwipe = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) swipeStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const endSwipe = (event: TouchEvent) => {
    const start = swipeStart.current;
    const touch = event.changedTouches[0];
    swipeStart.current = null;
    if (!start || !touch) return;

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return;
    moveTo(slideIndex + (deltaX < 0 ? 1 : -1));
  };

  const dots = tourSlides.map((slide, index) => (
    <button
      aria-label={`${index + 1}번째 기능: ${slide.title}`}
      aria-pressed={slideIndex === index}
      className={cn(
        'size-1.5 rounded-full transition-colors',
        slideIndex === index ? 'bg-primary' : 'bg-neutral-400',
      )}
      key={slide.title}
      onClick={() => moveTo(index)}
      type="button"
    />
  ));

  const slides = tourSlides.map((slide, index) => (
    <section
      aria-hidden={slideIndex !== index}
      className="relative w-1/3 shrink-0"
      inert={slideIndex !== index}
      key={slide.title}
    >
      <div className="relative z-10 flex flex-col items-center pt-[101px] text-center">
        <div
          className={cn(
            'flex flex-col items-center gap-2',
            index === 0 ? 'w-[185px]' : index === 1 ? 'w-[195px]' : 'w-[216px]',
          )}
        >
          <h1 className="text-head-1 text-primary">{slide.title}</h1>
          <p className={cn('text-body-1 text-neutral-700', index === 2 && 'w-[201px]')}>
            {slide.description}
          </p>
        </div>
      </div>
      <Image
        alt={`${slide.title} 화면 예시`}
        className={cn(
          'absolute left-1/2 top-[max(212px,calc(50%_-_202.5px))] h-[405px] -translate-x-1/2',
          index === 2 ? 'w-[333px]' : 'w-[192px]',
        )}
        priority={index === 0}
        src={slide.image}
      />
    </section>
  ));

  const isLastSlide = slideIndex === tourSlides.length - 1;
  const actionButton = (
    <BottomButton
      color={isLastSlide ? 'green' : 'black'}
      onClick={() => (isLastSlide ? onFinish() : moveTo(slideIndex + 1))}
    >
      {isLastSlide ? '디어블룸 시작하기' : '다음'}
    </BottomButton>
  );

  return (
    <main className="min-h-dvh bg-primary-100">
      <div
        aria-label="디어블룸 기능 둘러보기"
        className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden touch-pan-y focus:outline-none"
        onTouchCancel={() => {
          swipeStart.current = null;
        }}
        onTouchEnd={endSwipe}
        onTouchStart={startSwipe}
        tabIndex={0}
      >
        <div className="absolute left-1/2 top-[67px] z-20 flex -translate-x-1/2 gap-1">{dots}</div>
        <div
          aria-live="polite"
          className="flex min-h-dvh w-[300%] transition-transform duration-200 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${slideIndex * (100 / 3)}%)` }}
        >
          {slides}
        </div>
        <div className="fixed inset-x-0 bottom-0 z-20 bg-primary-100">
          <div className="mx-auto max-w-[375px] px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
            {actionButton}
          </div>
        </div>
      </div>
    </main>
  );
}

const regionLabel = (region: (typeof ARTIST_REGION_OPTIONS)[number]) => region.label;

function StepHeader({
  onBack,
  onSkip,
  step,
}: {
  onBack: () => void;
  onSkip?: () => void;
  step: 2 | 3;
}) {
  const skipButton = onSkip ? (
    <button className="px-2 text-caption-1 text-neutral-600" onClick={onSkip} type="button">
      건너뛰기
    </button>
  ) : null;

  return (
    <div>
      <Header onBack={onBack} right={skipButton} />
      <OnboardingProgress step={step} />
    </div>
  );
}

export function CustomerOnboardingForm({
  forceOnboarding,
  returnUrl,
}: {
  forceOnboarding: boolean;
  returnUrl?: string;
}) {
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
      <StepHeader onBack={() => router.back()} onSkip={() => setStep('region')} step={2} />,
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
          촬영을 원하는 학교의 지역을 골라 주세요.
          <br />
          이후 작가 추천과 일정 조율에 활용돼요.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">{regionOptions}</div>
      </section>
    );

    return pageShell(
      <StepHeader onBack={() => setStep('school')} onSkip={submit} step={3} />,
      content,
      footer('완료', submit),
    );
  }

  const finishOnboarding = () =>
    window.location.replace(withFlashToast(returnUrl ?? '/snaps', 'welcome'));

  if (step === 'tour') return <OnboardingTour onFinish={finishOnboarding} />;

  return <OnboardingComplete onExploreFeatures={() => setStep('tour')} />;
}
