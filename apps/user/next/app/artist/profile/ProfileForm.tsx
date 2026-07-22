'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ARTIST_REGION_OPTIONS, nicknameSchema, type ArtistMe, type ArtistRegionCode } from '@dearbloom/shared';

const schema = z.object({
  nickname: nicknameSchema,
  intro: z.string(),
  etcInfo: z.string(),
});
type FormValues = z.infer<typeof schema>;

export function ProfileForm({ initial }: { initial: ArtistMe }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nickname: initial.nickname ?? '',
      intro: initial.intro ?? '',
      etcInfo: initial.etcInfo ?? '',
    },
  });

  const [regions, setRegions] = useState<ArtistRegionCode[]>(initial.regionList ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);

  function toggleRegion(code: ArtistRegionCode) {
    setRegions((prev) => (prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code]));
  }

  async function uploadImage(file: File): Promise<string> {
    const p = await fetch('/app/api/artist/presigned', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: 'ARTIST_IMAGE', fileName: file.name }),
    });
    if (!p.ok) throw new Error('이미지 presigned 실패');
    const { presignedUrl, fileUrl } = (await p.json()) as { presignedUrl: string; fileUrl: string };
    const put = await fetch(presignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
    if (!put.ok) throw new Error('이미지 업로드 실패(S3)');
    return fileUrl;
  }

  const onValid = async (values: FormValues) => {
    try {
      const patch: {
        nickname: string;
        intro: string;
        regionList: ArtistRegionCode[];
        etcInfo: string;
        artistImageUrl?: string;
      } = { ...values, regionList: regions };
      if (imageFile) patch.artistImageUrl = await uploadImage(imageFile);

      const res = await fetch('/app/api/artist/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) {
        window.location.href = '/app/dev/login';
        return;
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error || '저장 실패');
      }
      toast.success('저장되었습니다.');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '오류가 발생했어요');
    }
  };

  const field = 'w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2.5 text-body-5 text-neutral-950 outline-none focus:border-primary';
  const label = 'mb-1 block text-body-4 text-neutral-800';
  const errText = 'mt-1 text-caption-1 text-danger';

  return (
    <form onSubmit={handleSubmit(onValid)} className="flex flex-col gap-5 px-4 py-5" noValidate>
      <div>
        <label className={label} htmlFor="nickname">닉네임</label>
        <input id="nickname" className={field} aria-invalid={!!errors.nickname} {...register('nickname')} />
        {errors.nickname && <p className={errText}>{errors.nickname.message}</p>}
      </div>

      <div>
        <label className={label} htmlFor="intro">작가 소개</label>
        <textarea id="intro" rows={4} className={field} placeholder="작가님을 소개해주세요" {...register('intro')} />
      </div>

      <div>
        <span className={label}>활동 지역</span>
        <div className="flex flex-wrap gap-1.5">
          {ARTIST_REGION_OPTIONS.map((r) => {
            const on = regions.includes(r.value);
            return (
              <button
                key={r.value}
                type="button"
                onClick={() => toggleRegion(r.value)}
                className={`rounded-full border px-3 py-1.5 text-caption-1 transition-colors ${
                  on ? 'border-primary bg-primary text-neutral-0' : 'border-neutral-300 bg-neutral-0 text-neutral-700'
                }`}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="etc">기타 안내</label>
        <textarea id="etc" rows={4} className={field} placeholder="예: 우천 시 날짜 변경 가능, 촬영 후 환불 불가 등" {...register('etcInfo')} />
      </div>

      <div>
        <label className={label} htmlFor="image">대표 이미지</label>
        {initial.imageUrl && !imageFile && <img src={initial.imageUrl} alt="현재 대표 이미지" className="mb-2 h-20 w-20 rounded-full object-cover" />}
        <input id="image" type="file" accept="image/*" className={field} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </div>

      <button type="submit" disabled={isSubmitting} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {isSubmitting ? '저장 중…' : '저장'}
      </button>
    </form>
  );
}
