'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { goLogin } from '@/src/lib/goLogin';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input, Spinner, Textarea, showToast } from '@dearbloom/ui';
import type { ArtworkPackage, ArtworkPhoto } from '@dearbloom/shared';
import { PhotoGridField, photoFromUrl, type PhotoItem } from '../../_components/PhotoGridField';
import {
  PackageListField,
  packageErrorMessage,
  packageFromServer,
  packageSchema,
  toPackagePayload,
  PKG_MSG,
} from '../../_components/PackageListField';

const schema = z.object({
  title: z.string().trim().min(1, '작품명을 입력해주세요.'),
  description: z.string().optional(),
  photos: z.array(z.custom<PhotoItem>()).min(1, '사진을 1장 이상 추가하세요.'),
  packageList: z.array(packageSchema).min(1, PKG_MSG),
});
type FormValues = z.infer<typeof schema>;

async function uploadOne(file: File): Promise<string> {
  const p = await fetch('/app/api/artist/presigned', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: 'PORTFOLIO', fileName: file.name }),
  });
  if (p.status === 401) throw new Error('로그인이 필요해요');
  if (!p.ok) throw new Error('presigned URL 발급 실패');
  const { presignedUrl, fileUrl } = (await p.json()) as { presignedUrl: string; fileUrl: string };
  const put = await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  if (!put.ok) throw new Error('사진 업로드 실패(S3)');
  return fileUrl;
}

export function EditForm({
  id,
  title: initTitle,
  description: initDesc,
  photos: initPhotos,
  packages: initPackages,
}: {
  id: number;
  title: string;
  description: string;
  photos: ArtworkPhoto[];
  packages: ArtworkPackage[];
}) {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initTitle,
      description: initDesc,
      photos: initPhotos.map((p) => photoFromUrl(p.fileUrl, p.universityId, p.universityName)),
      packageList: initPackages.map(packageFromServer),
    },
  });
  const [submitError, setSubmitError] = useState('');

  const onValid = async (values: FormValues) => {
    setSubmitError('');
    try {
      // 새로 추가한 사진만 업로드, 기존 사진은 fileUrl 재사용
      const photoList = [];
      for (const item of values.photos) {
        let { fileUrl } = item;
        if (item.file) fileUrl = await uploadOne(item.file);
        photoList.push({ fileUrl: fileUrl!, fileType: 'IMAGE' as const, universityId: item.universityId });
      }
      // 1) 기본 정보(제목·설명)
      const r1 = await fetch(`/app/api/artist/artworks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: values.title.trim(), description: values.description ?? '' }),
      });
      if (r1.status === 401) {
        goLogin();
        return;
      }
      if (!r1.ok) throw new Error('기본 정보 수정에 실패했어요.');
      // 2) 사진 전체 교체
      const r2 = await fetch(`/app/api/artist/artworks?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoList }),
      });
      if (!r2.ok) throw new Error('사진 수정에 실패했어요.');
      // 3) 패키지 전체 교체 (부분 수정이 아니라 이 목록이 그대로 최종 패키지가 된다)
      const r3 = await fetch(`/app/api/artist/artworks/packages?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageList: toPackagePayload(values.packageList) }),
      });
      if (!r3.ok) throw new Error('패키지 수정에 실패했어요.');
      showToast('저장되었습니다.');
      router.push('/artist/products');
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '오류가 발생했어요');
    }
  };

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 px-4 py-5" noValidate>
      <Field label="작품명" htmlFor="title" error={errors.title?.message}>
        <Input
          id="title"
          aria-invalid={!!errors.title}
          placeholder="작품 제목"
          defaultValue={initTitle}
          {...register('title')}
        />
      </Field>

      <Field label="작품 설명" htmlFor="description" optional>
        <Textarea
          id="description"
          rows={4}
          placeholder="작품을 소개해주세요"
          defaultValue={initDesc}
          {...register('description')}
        />
      </Field>

      <Field label="사진" helper="사진마다 촬영 학교를 지정할 수 있어요 (선택)" error={errors.photos?.message}>
        <Controller
          control={control}
          name="photos"
          render={({ field }) => <PhotoGridField value={field.value} onChange={field.onChange} />}
        />
      </Field>

      <Controller
        control={control}
        name="packageList"
        render={({ field }) => (
          <PackageListField
            value={field.value}
            onChange={field.onChange}
            errors={field.value.map((_, idx) => packageErrorMessage(errors.packageList?.[idx]))}
          />
        )}
      />

      <p className="rounded-md bg-neutral-100 px-3 py-2 text-caption-2 text-neutral-500">
        저장하면 위 목록이 이 작품의 패키지가 됩니다. 이미 들어온 문의·예약은 문의 시점의 조건이 유지돼요.
        <br />
        촬영 인원은 등록 시 설정한 값을 따릅니다. (수정은 추후 지원 예정)
      </p>

      {submitError && <p className="text-caption-1 text-danger">{submitError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? <Spinner className="text-current" label="" /> : null}
        {isSubmitting ? '저장 중…' : '저장'}
      </Button>
    </form>
  );
}
