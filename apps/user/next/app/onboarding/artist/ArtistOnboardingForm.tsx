'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import Image from 'next/image';

import { ARTIST_REGION_OPTIONS } from '@dearbloom/shared';
import { BottomButton, TextField } from '@dearbloom/ui';

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export function ArtistOnboardingForm({
  forceOnboarding,
  hasServerError,
}: {
  forceOnboarding: boolean;
  hasServerError: boolean;
}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState(
    hasServerError ? '작가 정보를 저장하지 못했습니다. 입력값을 확인해 주세요.' : '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!imageFile) {
      setError('프로필 사진을 선택해 주세요.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    if (forceOnboarding) {
      window.location.replace('/app/artist/dashboard');
      return;
    }

    try {
      const formData = new FormData(event.currentTarget);
      formData.set('imageUrl', await uploadImage(imageFile));
      const response = await fetch(event.currentTarget.action, { method: 'POST', body: formData });

      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }
      throw new Error('작가 정보를 저장하지 못했습니다.');
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
          <svg aria-hidden fill="none" height="18" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18">
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
    <div className="flex flex-col gap-6">
      <TextField
        autoComplete="name"
        id="artist-nickname"
        label="작가 이름"
        maxLength={20}
        minLength={1}
        name="nickname"
        placeholder="이름을 입력하세요"
        required
      />
      <TextField
        autoComplete="address-level1"
        id="artist-region"
        label="활동 지역"
        list="artist-region-options"
        name="region"
        placeholder="활동 지역을 입력하세요"
        required
      />
      <datalist id="artist-region-options">
        {ARTIST_REGION_OPTIONS.map((region) => (
          <option key={region.value} value={region.label} />
        ))}
      </datalist>
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
    <form action="/app/api/members/artist" className="mt-6 flex flex-col gap-7" method="post" onSubmit={submit}>
      {imageField}
      {details}
      {errorMessage}
      {submitButton}
    </form>
  );
}
