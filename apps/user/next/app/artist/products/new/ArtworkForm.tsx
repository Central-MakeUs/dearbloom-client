'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import {
  Button,
  Card,
  Field,
  Input,
  NumberField,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@dearbloom/ui';
import { PhotoGridField, type PhotoItem } from '../_components/PhotoGridField';

// 촬영 시간: 30분 단위(30분 ~ 6시간) — 백엔드는 임의 정수(분)를 받으나 UX상 30분 단위로 고정
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

const PKG_MSG = '각 패키지의 이름·가격·촬영 시간·보정본 수를 입력하세요.';
const HEAD_MSG = '촬영 인원(최소·최대)을 입력하세요.';

/** NumberField/Select 는 값이 number | '' 이므로, '' 이거나 임계값 이하이면 실패 처리. */
const requiredNumber = (message: string, gt = 0) =>
  z
    .union([z.literal(''), z.number()])
    .refine((v) => typeof v === 'number' && v > gt, { message });

const packageSchema = z.object({
  packageName: z.string().trim().min(1, PKG_MSG),
  price: requiredNumber(PKG_MSG),
  durationMinutes: requiredNumber(PKG_MSG),
  finalPhotoCount: requiredNumber(PKG_MSG),
});

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
type PackageForm = FormValues['packageList'][number];

const emptyPackage = (): PackageForm => ({ packageName: '', price: '', durationMinutes: '', finalPhotoCount: '' });

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
  const { fields, append, remove } = useFieldArray({ control, name: 'packageList' });

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
          packageList: values.packageList.map((p) => ({
            packageName: p.packageName.trim(),
            price: Number(p.price),
            durationMinutes: Number(p.durationMinutes),
            finalPhotoCount: Number(p.finalPhotoCount),
          })),
        }),
      });
      if (res.status === 401) {
        window.location.href = '/app/dev/login';
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
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-body-4 text-neutral-800">촬영 구성 (패키지)</span>
        <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={() => append(emptyPackage())}>
          <Plus className="size-4" /> 패키지 추가
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {fields.map((f, idx) => {
          const pkgErr = errors.packageList?.[idx];
          const pkgMsg =
            pkgErr?.packageName?.message ||
            pkgErr?.price?.message ||
            pkgErr?.durationMinutes?.message ||
            pkgErr?.finalPhotoCount?.message;
          return (
            <Card key={f.id} className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-body-6 text-neutral-600">패키지 {idx + 1}</span>
                {fields.length > 1 && (
                  <button type="button" onClick={() => remove(idx)} className="text-neutral-400 hover:text-danger" aria-label="패키지 삭제">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Input
                  {...register(`packageList.${idx}.packageName` as const)}
                  placeholder="패키지명 (예: 기본)"
                  aria-label="패키지명"
                />
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name={`packageList.${idx}.price` as const}
                    render={({ field }) => (
                      <NumberField
                        value={field.value}
                        onValueChange={field.onChange}
                        min={0}
                        step={10000}
                        placeholder="가격"
                        suffix="원"
                        aria-label="가격"
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`packageList.${idx}.durationMinutes` as const}
                    render={({ field }) => (
                      <Select
                        value={field.value === '' ? undefined : String(field.value)}
                        onValueChange={(v) => field.onChange(Number(v))}
                      >
                        <SelectTrigger aria-label="촬영 시간">
                          <SelectValue placeholder="촬영 시간" />
                        </SelectTrigger>
                        <SelectContent>
                          {DURATION_OPTIONS.map((m) => (
                            <SelectItem key={m} value={String(m)}>
                              {fmtDuration(m)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <Controller
                  control={control}
                  name={`packageList.${idx}.finalPhotoCount` as const}
                  render={({ field }) => (
                    <NumberField
                      value={field.value}
                      onValueChange={field.onChange}
                      min={1}
                      placeholder="보정본 수"
                      suffix="장"
                      aria-label="보정본 수"
                    />
                  )}
                />
              </div>
              {pkgMsg && <p className="mt-2 text-caption-1 text-danger">{pkgMsg}</p>}
            </Card>
          );
        })}
      </div>
    </div>
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
            render={({ field }) => <NumberField value={field.value} onValueChange={field.onChange} min={1} aria-label="최소 인원" />}
          />
          <span className="shrink-0 text-body-5 text-neutral-500">~</span>
          <Controller
            control={control}
            name="maxHeadCount"
            render={({ field }) => (
              <NumberField value={field.value} onValueChange={field.onChange} min={1} placeholder="최대" aria-label="최대 인원" />
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
