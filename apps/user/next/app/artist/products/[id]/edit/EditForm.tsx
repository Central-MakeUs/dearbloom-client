'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button, Field, Input, Textarea } from '@dearbloom/ui';
import type { ArtworkPhoto } from '@dearbloom/shared';
import { PhotoGridField, photoFromUrl, type PhotoItem } from '../../_components/PhotoGridField';

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
}: {
  id: number;
  title: string;
  description: string;
  photos: ArtworkPhoto[];
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initTitle);
  const [description, setDescription] = useState(initDesc);
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    initPhotos.map((p) => photoFromUrl(p.fileUrl, p.universityId, p.universityName)),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('작품명을 입력해주세요.');
      return;
    }
    if (photos.length === 0) {
      setError('사진을 1장 이상 추가하세요.');
      return;
    }
    setBusy(true);
    try {
      // 새로 추가한 사진만 업로드, 기존 사진은 fileUrl 재사용
      const photoList = [];
      for (const item of photos) {
        let { fileUrl } = item;
        if (item.file) fileUrl = await uploadOne(item.file);
        photoList.push({ fileUrl: fileUrl!, fileType: 'IMAGE' as const, universityId: item.universityId });
      }
      // 1) 기본 정보(제목·설명)
      const r1 = await fetch(`/app/api/artist/artworks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description }),
      });
      if (r1.status === 401) {
        window.location.href = '/app/dev/login';
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
      toast.success('저장되었습니다.');
      router.push('/artist/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <Field label="작품명" htmlFor="title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작품 제목" />
      </Field>

      <Field label="작품 설명" htmlFor="description" optional>
        <Textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="작품을 소개해주세요" />
      </Field>

      <Field label="사진" helper="사진마다 촬영 학교를 지정할 수 있어요 (선택)">
        <PhotoGridField value={photos} onChange={setPhotos} />
      </Field>

      <p className="rounded-md bg-neutral-100 px-3 py-2 text-caption-2 text-neutral-500">
        가격·패키지·촬영 인원은 등록 시 설정한 값을 따릅니다. (수정은 추후 지원 예정)
      </p>

      {error && <p className="text-caption-1 text-danger">{error}</p>}

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? '저장 중…' : '저장'}
      </Button>
    </form>
  );
}
