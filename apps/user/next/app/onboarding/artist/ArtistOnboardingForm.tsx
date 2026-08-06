'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';

import { nicknameSchema, type ArtistRegionCode } from '@dearbloom/shared';
import { BottomButton, TextField } from '@dearbloom/ui';

import { ArtistRegionField } from '@/src/components/common/ArtistRegionField';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function ArtistOnboardingForm({ forceOnboarding }: { forceOnboarding: boolean }) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');
  const [isNicknameTouched, setIsNicknameTouched] = useState(false);
  const [regions, setRegions] = useState<ArtistRegionCode[]>([]);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nicknameResult = nicknameSchema.safeParse(nickname);
  const nicknameError =
    isNicknameTouched && !nicknameResult.success
      ? nicknameResult.error.issues[0]?.message
      : undefined;

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

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!imageFile) {
      setError('프로필 사진을 선택해 주세요.');
      return;
    }
    if (!nicknameResult.success) {
      setIsNicknameTouched(true);
      setError('');
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
      window.location.replace('/app/artist/dashboard');
      return;
    }

    try {
      const formData = new FormData(form);
      formData.delete('region');
      regions.forEach((region) => formData.append('region', region));
      formData.set('imageUrl', await uploadImage(imageFile));
      const response = await fetch(form.action, { method: 'POST', body: formData });

      // 성공 시에만 라우트가 303 으로 새 accessToken 쿠키와 함께 대시보드로 보낸다.
      // 실패는 JSON 이라 이 화면에 머물며, 업로드한 사진·선택한 지역이 그대로 남는다.
      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? '작가 정보를 저장하지 못했습니다.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '오류가 발생했습니다.');
      setIsSubmitting(false);
    }
  }

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
        className="relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-neutral-200 ring-2 ring-neutral-0 shadow-elevation focus-within:ring-primary"
        htmlFor="artist-profile-image"
      >
        {profileImage}
        <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-neutral-0 bg-primary text-neutral-0">
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

  const nicknameHelper = (
    <span className="flex justify-between" role={nicknameError ? 'alert' : undefined}>
      <span>{nicknameError ?? '2-12자의 한글, 영문, 숫자'}</span>
      <span>{nickname.length}/12</span>
    </span>
  );

  const details = (
    <div className="flex flex-col gap-6">
      <TextField
        autoComplete="name"
        error={!!nicknameError}
        helper={nicknameHelper}
        id="artist-nickname"
        label="작가 이름"
        maxLength={12}
        name="nickname"
        onBlur={() => setIsNicknameTouched(true)}
        onChange={(event) => setNickname(event.target.value)}
        onClear={() => setNickname('')}
        placeholder="이름을 입력하세요"
        required
        value={nickname}
      />
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

  const errorMessage = error ? (
    <p className="text-caption-1 text-danger" role="alert">
      {error}
    </p>
  ) : null;

  const submitButton = (
    <div className="absolute inset-x-0 bottom-0 bg-neutral-100 px-4 pb-[max(8px,env(safe-area-inset-bottom))] pt-2">
      <BottomButton disabled={isSubmitting} type="submit">
        {isSubmitting ? '저장 중…' : '다음'}
      </BottomButton>
    </div>
  );

  return (
    <form
      action="/app/api/members/artist"
      className="mt-6 flex flex-col gap-7"
      method="post"
      onSubmit={submit}
    >
      {imageField}
      {details}
      {errorMessage}
      {submitButton}
    </form>
  );
}
