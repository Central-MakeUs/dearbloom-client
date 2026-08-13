'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LOGIN_HREF } from '@/src/lib/env';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Field, Input, NumberField, Textarea } from '@dearbloom/ui';
import { PhotoGridField, type PhotoItem } from '../_components/PhotoGridField';
import {
  PackageListField,
  emptyPackage,
  packageErrorMessage,
  packageSchema,
  requiredNumber,
  toPackagePayload,
  PKG_MSG,
} from '../_components/PackageListField';

const HEAD_MSG = '촬영 인원(최소·최대)을 입력하세요.';

const schema = z
  .object({
    title: z.string().trim().min(1, '작품 제목을 입력하세요.'),
    description: z.string().optional(),
    minHeadCount: requiredNumber(HEAD_MSG),
    maxHeadCount: requiredNumber(HEAD_MSG),
    photos: z.array(z.custom<PhotoItem>()).min(1, '사진을 1장 이상 추가하세요.'),
    packageList: z.array(packageSchema).min(1, PKG_MSG),
  })
  .refine(
    (v) => {
      if (typeof v.minHeadCount !== 'number' || typeof v.maxHeadCount !== 'number') return true;
      return v.maxHeadCount >= v.minHeadCount;
    },
    { message: '최대 인원은 최소 인원보다 크거나 같아야 해요.', path: ['maxHeadCount'] },
  );

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

export function ArtworkForm() {
  const router = useRouter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      minHeadCount: 1,
      maxHeadCount: '',
      photos: [],
      packageList: [emptyPackage()],
    },
  });

  const [progress, setProgress] = useState('');
  const [submitError, setSubmitError] = useState('');

  const onValid = async (values: FormValues) => {
    setSubmitError('');
    try {
      const photoList = [];
      for (let i = 0; i < values.photos.length; i += 1) {
        const item = values.photos[i]!;
        let { fileUrl } = item;
        if (item.file) {
          setProgress(`사진 업로드 중 ${i + 1}/${values.photos.length}`);
          fileUrl = await uploadOne(item.file);
        }
        photoList.push({ fileUrl: fileUrl!, fileType: 'IMAGE' as const, universityId: item.universityId });
      }
      setProgress('작품 등록 중…');
      const res = await fetch('/app/api/artist/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
          minHeadCount: Number(values.minHeadCount),
          maxHeadCount: Number(values.maxHeadCount),
          photoList,
          packageList: toPackagePayload(values.packageList),
        }),
      });
      if (res.status === 401) {
        window.location.href = LOGIN_HREF;
        return;
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error || '작품 등록 실패');
      }
      router.push('/artist/products');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '오류가 발생했어요');
    } finally {
      setProgress('');
    }
  };

  const packageSection = (
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
  );

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 px-4 py-5" noValidate>
      <Field label="제목" htmlFor="title" error={errors.title?.message}>
        <Input id="title" aria-invalid={!!errors.title} placeholder="작품 제목" {...register('title')} />
      </Field>

      <Field label="작품 설명" htmlFor="description" optional>
        <Textarea id="description" rows={3} placeholder="작품에 대한 설명을 적어주세요." {...register('description')} />
      </Field>

      <Field label="촬영 인원" error={errors.minHeadCount?.message ?? errors.maxHeadCount?.message}>
        <div className="flex items-center gap-2">
          <Controller
            control={control}
            name="minHeadCount"
            render={({ field }) => <NumberField className="flex-1" value={field.value} onValueChange={field.onChange} min={1} aria-label="최소 인원" />}
          />
          <span className="shrink-0 text-body-5 text-neutral-500">~</span>
          <Controller
            control={control}
            name="maxHeadCount"
            render={({ field }) => (
              <NumberField className="flex-1" value={field.value} onValueChange={field.onChange} min={1} placeholder="최대" aria-label="최대 인원" />
            )}
          />
          <span className="shrink-0 text-body-5 text-neutral-600">명</span>
        </div>
      </Field>

      <Field label="사진" helper="사진마다 촬영 학교를 지정할 수 있어요 (선택)" error={errors.photos?.message}>
        <Controller
          control={control}
          name="photos"
          render={({ field }) => <PhotoGridField value={field.value} onChange={field.onChange} />}
        />
      </Field>

      {packageSection}

      {submitError && <p className="text-caption-1 text-danger">{submitError}</p>}
      {progress && <p className="text-caption-1 text-neutral-500">{progress}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? '등록 중…' : '작품 등록'}
      </Button>
    </form>
  );
}
