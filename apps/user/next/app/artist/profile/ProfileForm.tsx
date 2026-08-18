'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nicknameSchema, type ArtistMe, type ArtistRegionCode } from '@dearbloom/shared';
import { Button, Field, Input, Spinner, Textarea, showToast } from '@dearbloom/ui';
import { ArtistRegionField } from '@/src/components/common/ArtistRegionField';
import { FileField } from '@/src/components/common/FileField';
import { goLogin } from '@/src/lib/goLogin';
import { optimizedImageUrl } from '@/src/lib/imageUrl';

const schema = z.object({
  nickname: nicknameSchema,
  intro: z.string(),
  travelFee: z.string(),
});
type FormValues = z.infer<typeof schema>;

/** 활동 지역 비교(순서 무관). */
function sameRegions(a: ArtistRegionCode[], b: ArtistRegionCode[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

const REGION_REQUIRED_MSG = '활동 지역을 1개 이상 선택해주세요';

export function ProfileForm({ initial }: { initial: ArtistMe }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: initial.nickname ?? '',
      intro: initial.intro ?? '',
      travelFee: initial.travelFee ?? '',
    },
  });

  const initialRegions = initial.regionList ?? [];
  const [regions, setRegions] = useState<ArtistRegionCode[]>(initialRegions);
  const [regionError, setRegionError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  async function uploadImage(file: File): Promise<string> {
    const p = await fetch('/app/api/artist/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: 'ARTIST_IMAGE', fileName: file.name }),
    });
    if (!p.ok) throw new Error('이미지 presigned 실패');
    const { presignedUrl, fileUrl } = (await p.json()) as { presignedUrl: string; fileUrl: string };
    const put = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!put.ok) throw new Error('이미지 업로드 실패(S3)');
    return fileUrl;
  }

  const onValid = async (values: FormValues) => {
    // FIX #1: 활동 지역 클라이언트 선검증 — 미선택이면 API 호출 없이 인라인 에러.
    if (regions.length === 0) {
      setRegionError(REGION_REQUIRED_MSG);
      return;
    }
    setRegionError(null);

    try {
      // FIX #4: 실제로 변경된 필드만 전송.
      const patch: {
        nickname?: string;
        intro?: string;
        regionList?: ArtistRegionCode[];
        travelFee?: string;
        artistImageUrl?: string;
      } = {};
      if (dirtyFields.nickname) patch.nickname = values.nickname;
      if (dirtyFields.intro) patch.intro = values.intro;
      if (dirtyFields.travelFee) patch.travelFee = values.travelFee;
      if (!sameRegions(regions, initialRegions)) patch.regionList = regions;
      if (imageFile) patch.artistImageUrl = await uploadImage(imageFile);

      // 변경 사항이 없으면 네트워크 호출 생략.
      if (Object.keys(patch).length === 0) {
        showToast('저장되었습니다.');
        router.push('/artist/my');
        return;
      }

      const res = await fetch('/app/api/artist/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) {
        goLogin();
        return;
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 409) {
          setError('nickname', { type: 'manual', message: '이미 존재하는 프로필 이름입니다' });
          return;
        }
        throw new Error(b.error || '저장 실패');
      }
      showToast('저장되었습니다.');
      router.push('/artist/my');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '오류가 발생했어요', 'error');
    }
  };

  const label = 'mb-1 block text-body-4 text-neutral-800';

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 px-4 py-5" noValidate>
      <Field label="프로필 이름" htmlFor="nickname" error={errors.nickname?.message}>
        <Input
          id="nickname"
          aria-invalid={!!errors.nickname}
          defaultValue={initial.nickname ?? ''}
          {...register('nickname')}
        />
      </Field>

      <Field label="작가 소개" htmlFor="intro">
        <Textarea
          id="intro"
          rows={4}
          placeholder="작가님을 소개해주세요"
          defaultValue={initial.intro ?? ''}
          {...register('intro')}
        />
      </Field>

      <ArtistRegionField
        error={regionError}
        onValueChange={(next) => {
          setRegions(next);
          if (next.length > 0) setRegionError(null);
        }}
        value={regions}
      />

      <Field label="출장비 안내" htmlFor="travelFee">
        <Textarea
          id="travelFee"
          rows={4}
          placeholder="예: 서울 전역 무료, 경기권 3만원, 그 외 지역 협의"
          defaultValue={initial.travelFee ?? ''}
          {...register('travelFee')}
        />
      </Field>

      <div>
        <span className={label}>대표 이미지</span>
        {initial.imageUrl && !imageFile && (
          <img
            src={optimizedImageUrl(initial.imageUrl, 80)}
            alt="현재 대표 이미지"
            className="mb-2 h-20 w-20 rounded-full object-cover"
          />
        )}
        <FileField
          accept="image/*"
          buttonLabel="사진 선택"
          emptyText="선택된 파일 없음"
          onFiles={(files) => setImageFile(files[0] ?? null)}
          ariaLabel="대표 이미지"
        />
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? <Spinner className="text-current" label="" /> : null}
        {isSubmitting ? '저장 중…' : '저장'}
      </Button>
    </form>
  );
}
