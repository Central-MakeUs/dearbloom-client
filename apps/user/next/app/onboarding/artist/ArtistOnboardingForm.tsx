'use client';

import { useState, type ChangeEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { nicknameSchema, type ArtistRegionCode } from '@dearbloom/shared';
import { BottomButton, Header, Spinner, TextField } from '@dearbloom/ui';

import { ArtistRegionField } from '@/src/components/common/ArtistRegionField';
import { OnboardingProgress } from '@/src/components/common/OnboardingProgress';
import { withFlashToast } from '@/src/lib/flashToast';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function StepHeader({ onBack, step }: { onBack: () => void; step: 2 | 3 }) {
  return (
    <div>
      <Header onBack={onBack} />
      <OnboardingProgress step={step} total={3} />
    </div>
  );
}

export function ArtistOnboardingForm({
  forceOnboarding,
  hasServerError,
}: {
  forceOnboarding: boolean;
  hasServerError: boolean;
}) {
  const router = useRouter();
  const [step, setStep] = useState<'name' | 'profile'>('name');
  const [name, setName] = useState('');
  const [isNameTouched, setIsNameTouched] = useState(false);
  const [isDuplicateNickname, setIsDuplicateNickname] = useState(false);
  const [isCheckingName, setIsCheckingName] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [regions, setRegions] = useState<ArtistRegionCode[]>([]);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [error, setError] = useState(
    hasServerError ? '작가 정보를 저장하지 못했습니다. 입력값을 확인해 주세요.' : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedName = name.trim();
  const parsedName = nicknameSchema.safeParse(trimmedName);
  const isNameValid = parsedName.success;
  const nameError = isDuplicateNickname
    ? '이미 존재하는 프로필 이름이에요.'
    : (isNameTouched || name.length > 0) && !parsedName.success
      ? parsedName.error.issues[0]?.message
      : undefined;

  const continueFromName = async () => {
    if (!isNameValid || isCheckingName) return;
    if (forceOnboarding) {
      setStep('profile');
      return;
    }

    setError('');
    setIsCheckingName(true);

    try {
      const response = await fetch(
        `/app/api/members/artist/nickname/availability?nickname=${encodeURIComponent(trimmedName)}`,
      );
      const body = (await response.json()) as { available?: boolean; message?: string };
      if (!response.ok) throw new Error(body.message);

      setIsDuplicateNickname(body.available === false);
      if (body.available) setStep('profile');
    } catch (caught) {
      setError(
        caught instanceof Error && caught.message
          ? caught.message
          : '프로필 이름 중복 여부를 확인하지 못했습니다.',
      );
    } finally {
      setIsCheckingName(false);
    }
  };

  function selectImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setError('');

    if (!file) {
      setImageFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 선택해 주세요.');
      event.target.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('10MB 이하 이미지를 선택해 주세요.');
      event.target.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function uploadImage(file: File) {
    const response = await fetch('/app/api/artist/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: 'ARTIST_IMAGE', fileName: file.name }),
    });
    if (!response.ok) throw new Error('사진 업로드를 준비하지 못했습니다.');

    const { presignedUrl, fileUrl } = (await response.json()) as {
      presignedUrl: string;
      fileUrl: string;
    };
    const upload = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!upload.ok) throw new Error('사진을 업로드하지 못했습니다.');
    return fileUrl;
  }

  const submit = async () => {
    if (!imageFile) {
      setError('프로필 사진을 선택해 주세요.');
      return;
    }
    if (regions.length === 0) {
      setRegionError('활동 지역을 1개 이상 선택해주세요');
      return;
    }

    setError('');
    setRegionError(null);
    setIsSubmitting(true);

    if (forceOnboarding) {
      window.location.replace(withFlashToast('/app/artist/dashboard', 'welcome'));
      return;
    }

    try {
      const formData = new FormData();
      regions.forEach((region) => formData.append('region', region));
      formData.set('imageUrl', await uploadImage(imageFile));
      formData.set('nickname', trimmedName);

      const response = await fetch('/app/api/members/artist', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 409) {
        setIsDuplicateNickname(true);
        setStep('name');
        setIsSubmitting(false);
        return;
      }

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const body = (await response.json()) as { message?: string };
      throw new Error(body.message ?? '작가 정보를 저장하지 못했습니다.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  };

  const profileImage = previewUrl ? (
    <Image
      alt="선택한 프로필 사진 미리보기"
      className="object-cover"
      fill
      src={previewUrl}
      unoptimized
    />
  ) : (
    <svg aria-hidden className="h-12 w-12 text-neutral-400" fill="none" viewBox="0 0 48 48">
      <circle cx="24" cy="18" r="8" fill="currentColor" />
      <path d="M9 42c1.5-9 6.5-14 15-14s13.5 5 15 14" fill="currentColor" />
    </svg>
  );

  const imageField = (
    <div className="flex flex-col items-center gap-3">
      <label
        className="relative block h-28 w-28 cursor-pointer rounded-full bg-neutral-200 ring-2 ring-neutral-0 shadow-elevation transition-shadow active:ring-primary"
        htmlFor="artist-profile-image"
      >
        <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full">
          {profileImage}
        </div>
        <span className="absolute bottom-0 right-0 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-0 bg-primary text-neutral-0 shadow-md">
          <svg
            aria-hidden
            fill="none"
            height="18"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="18"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </span>
        <input
          accept="image/*"
          className="sr-only"
          id="artist-profile-image"
          onChange={selectImage}
          required
          type="file"
        />
      </label>
      <div className="text-center">
        <p className="text-body-4 text-neutral-950">프로필 사진</p>
        <p className="mt-1 text-caption-2 text-neutral-500">10MB 이하 이미지</p>
      </div>
    </div>
  );

  const details = (
    <div>
      <ArtistRegionField
        error={regionError}
        onValueChange={(next) => {
          setRegions(next);
          if (next.length > 0) setRegionError(null);
        }}
        value={regions}
      />
    </div>
  );

  const pageShell = (header: ReactNode, content: ReactNode, footer: ReactNode) => (
    <main className="min-h-dvh bg-neutral-100">
      <div className="relative mx-auto min-h-dvh max-w-[375px] overflow-hidden pb-24">
        {header}
        {content}
        {footer}
      </div>
    </main>
  );

  const footer = (
    label: string,
    onClick: () => void,
    disabled = false,
    color: 'black' | 'green' = 'black',
  ) => (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      {error ? (
        <p className="mb-2 text-center text-caption-1 text-danger" role="alert">
          {error}
        </p>
      ) : null}
      <BottomButton
        color={color}
        disabled={disabled || isSubmitting || isCheckingName}
        onClick={onClick}
      >
        {isSubmitting || isCheckingName ? (
          <Spinner className="size-5 text-current" label="" />
        ) : null}
        {isSubmitting ? '저장 중…' : isCheckingName ? '확인 중…' : label}
      </BottomButton>
    </div>
  );

  if (step === 'name') {
    const content = (
      <section className="pt-7">
        <div className="px-5">
          <h1 className="text-head-1 text-neutral-900">작가 또는 사진관 이름을 입력해 주세요.</h1>
          <p className="mt-2 text-body-2 text-neutral-800">
            고객과 원활하게 소통할 수 있도록
            <br />
            설정한 이름이 고객에게 표시돼요.
          </p>
        </div>
        <div className="mt-8 px-4">
          <TextField
            autoComplete="name"
            counter={`${name.length}/12`}
            error={!!nameError}
            helper={nameError ?? '최대 12자까지 입력할 수 있어요'}
            id="artist-name"
            label="프로필 이름"
            maxLength={12}
            minLength={2}
            onBlur={() => setIsNameTouched(true)}
            onChange={(event) => {
              setName(event.target.value);
              setIsDuplicateNickname(false);
              setError('');
            }}
            onClear={() => {
              setName('');
              setIsDuplicateNickname(false);
              setError('');
            }}
            pattern="^[가-힣a-zA-Z0-9_]+( [가-힣a-zA-Z0-9_]+)*$"
            placeholder="프로필에 표시될 이름을 입력해주세요"
            required
            value={name}
          />
        </div>
      </section>
    );

    return pageShell(
      <StepHeader onBack={() => router.back()} step={2} />,
      content,
      footer('다음', continueFromName, !isNameValid),
    );
  }

  const content = (
    <section className="px-4 pt-2">
      <div className="px-1 py-3">
        <h1 className="text-head-1 text-neutral-900">작가 프로필을 완성해 주세요.</h1>
        <p className="mt-3 text-body-2 text-neutral-800">
          고객에게 보여질 사진과
          <br />
          주로 활동하는 지역을 입력해 주세요.
        </p>
      </div>
      <div className="mt-6 flex flex-col gap-7">
        {imageField}
        {details}
      </div>
    </section>
  );

  return pageShell(
    <StepHeader onBack={() => setStep('name')} step={3} />,
    content,
    footer('디어블룸 시작하기', submit, !imageFile || regions.length === 0, 'green'),
  );
}
