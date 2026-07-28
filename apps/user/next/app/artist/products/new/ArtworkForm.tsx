'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
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

interface PackageDraft {
  packageName: string;
  price: number | '';
  durationMinutes: number | '';
  finalPhotoCount: number | '';
}

const emptyPackage = (): PackageDraft => ({ packageName: '', price: '', durationMinutes: '', finalPhotoCount: '' });

// 촬영 시간: 30분 단위(30분 ~ 6시간) — 백엔드는 임의 정수(분)를 받으나 UX상 30분 단위로 고정
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minHead, setMinHead] = useState<number | ''>(1);
  const [maxHead, setMaxHead] = useState<number | ''>('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [packages, setPackages] = useState<PackageDraft[]>([emptyPackage()]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  function updatePackage(idx: number, patch: Partial<PackageDraft>) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  const addPackage = () => setPackages((prev) => [...prev, emptyPackage()]);
  const removePackage = (idx: number) => setPackages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));

  function validate(): string | null {
    if (!title.trim()) return '작품 제목을 입력하세요.';
    if (photos.length === 0) return '사진을 1장 이상 추가하세요.';
    if (!minHead || !maxHead) return '촬영 인원(최소·최대)을 입력하세요.';
    if (maxHead < minHead) return '최대 인원은 최소 인원보다 크거나 같아야 해요.';
    for (const p of packages) {
      if (!p.packageName.trim() || !p.price || !p.durationMinutes || !p.finalPhotoCount) {
        return '각 패키지의 이름·가격·촬영 시간·보정본 수를 입력하세요.';
      }
    }
    return null;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    const invalid = validate();
    if (invalid) {
      setError(invalid);
      return;
    }
    setBusy(true);
    try {
      const photoList = [];
      for (let i = 0; i < photos.length; i += 1) {
        const item = photos[i]!;
        let { fileUrl } = item;
        if (item.file) {
          setProgress(`사진 업로드 중 ${i + 1}/${photos.length}`);
          fileUrl = await uploadOne(item.file);
        }
        photoList.push({ fileUrl: fileUrl!, fileType: 'IMAGE' as const, universityId: item.universityId });
      }
      setProgress('작품 등록 중…');
      const res = await fetch('/app/api/artist/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          minHeadCount: Number(minHead),
          maxHeadCount: Number(maxHead),
          photoList,
          packageList: packages.map((p) => ({
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
      setError(err instanceof Error ? err.message : '오류가 발생했어요');
    } finally {
      setBusy(false);
      setProgress('');
    }
  }

  const packageSection = (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className="text-body-4 text-neutral-800">촬영 구성 (패키지)</span>
        <Button type="button" variant="link" size="sm" className="h-auto px-0" onClick={addPackage}>
          <Plus className="size-4" /> 패키지 추가
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {packages.map((p, idx) => (
          <Card key={idx} className="p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-6 text-neutral-600">패키지 {idx + 1}</span>
              {packages.length > 1 && (
                <button type="button" onClick={() => removePackage(idx)} className="text-neutral-400 hover:text-danger" aria-label="패키지 삭제">
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Input
                value={p.packageName}
                onChange={(e) => updatePackage(idx, { packageName: e.target.value })}
                placeholder="패키지명 (예: 기본)"
                aria-label="패키지명"
              />
              <div className="flex gap-2">
                <NumberField
                  value={p.price}
                  onValueChange={(v) => updatePackage(idx, { price: v })}
                  min={0}
                  step={10000}
                  placeholder="가격"
                  suffix="원"
                  aria-label="가격"
                />
                <Select
                  value={p.durationMinutes === '' ? undefined : String(p.durationMinutes)}
                  onValueChange={(v) => updatePackage(idx, { durationMinutes: Number(v) })}
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
              </div>
              <NumberField
                value={p.finalPhotoCount}
                onValueChange={(v) => updatePackage(idx, { finalPhotoCount: v })}
                min={1}
                placeholder="보정본 수"
                suffix="장"
                aria-label="보정본 수"
              />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <Field label="제목" htmlFor="title">
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작품 제목" />
      </Field>

      <Field label="작품 설명" htmlFor="description" optional>
        <Textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="작품에 대한 설명을 적어주세요."
        />
      </Field>

      <Field label="촬영 인원">
        <div className="flex items-center gap-2">
          <NumberField value={minHead} onValueChange={setMinHead} min={1} aria-label="최소 인원" />
          <span className="shrink-0 text-body-5 text-neutral-500">~</span>
          <NumberField value={maxHead} onValueChange={setMaxHead} min={1} placeholder="최대" aria-label="최대 인원" />
          <span className="shrink-0 text-body-5 text-neutral-600">명</span>
        </div>
      </Field>

      <Field label="사진" helper="사진마다 촬영 학교를 지정할 수 있어요 (선택)">
        <PhotoGridField value={photos} onChange={setPhotos} />
      </Field>

      {packageSection}

      {error && <p className="text-caption-1 text-danger">{error}</p>}
      {progress && <p className="text-caption-1 text-neutral-500">{progress}</p>}

      <Button type="submit" size="lg" disabled={busy}>
        {busy ? '등록 중…' : '작품 등록'}
      </Button>
    </form>
  );
}
