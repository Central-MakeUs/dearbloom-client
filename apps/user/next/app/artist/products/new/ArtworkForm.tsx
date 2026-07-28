'use client';

import { useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { University } from '@dearbloom/shared';

interface PackageDraft {
  packageName: string;
  price: string;
  durationMinutes: string;
  finalPhotoCount: string;
}

const emptyPackage = (): PackageDraft => ({ packageName: '', price: '', durationMinutes: '', finalPhotoCount: '' });

/** 사진 1건 + 사진별 촬영 학교(선택) */
interface PhotoItem {
  id: string;
  file: File;
  previewUrl: string;
  universityId: number | null;
  uniName: string | null;
}

// 촬영 시간: 30분 단위(30분 ~ 6시간)
const DURATION_OPTIONS = Array.from({ length: 12 }, (_, i) => (i + 1) * 30);
function fmtDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m) return `${h}시간 ${m}분`;
  if (h) return `${h}시간`;
  return `${m}분`;
}

export function ArtworkForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minHead, setMinHead] = useState('1');
  const [maxHead, setMaxHead] = useState('');
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [packages, setPackages] = useState<PackageDraft[]>([emptyPackage()]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  // 사진별 학교 배정 패널 — assignTarget 은 학교를 배정할 대상 사진 id 목록
  const [assignTarget, setAssignTarget] = useState<string[] | null>(null);
  const [uniQuery, setUniQuery] = useState('');
  const [uniResults, setUniResults] = useState<University[]>([]);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const idRef = useRef(0);

  function addPhotos(files: File[]) {
    if (files.length === 0) return;
    const items: PhotoItem[] = files.map((file) => ({
      id: `p${idRef.current++}`,
      file,
      previewUrl: URL.createObjectURL(file),
      universityId: null,
      uniName: null,
    }));
    setPhotos((prev) => [...prev, ...items]);
  }
  function removePhoto(id: string) {
    setPhotos((prev) => {
      const t = prev.find((p) => p.id === id);
      if (t) URL.revokeObjectURL(t.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
    setSelected((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
  }
  function toggleSelect(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function searchUni(q: string) {
    setUniQuery(q);
    if (q.trim().length < 1) {
      setUniResults([]);
      return;
    }
    try {
      const res = await fetch(`/app/api/universities?keyword=${encodeURIComponent(q)}`);
      setUniResults(res.ok ? await res.json() : []);
    } catch {
      setUniResults([]);
    }
  }
  function openAssign(ids: string[]) {
    if (ids.length === 0) return;
    setAssignTarget(ids);
    setUniQuery('');
    setUniResults([]);
  }
  function assignUni(u: University) {
    if (!assignTarget) return;
    const set = new Set(assignTarget);
    setPhotos((prev) => prev.map((p) => (set.has(p.id) ? { ...p, universityId: u.universityId, uniName: u.name } : p)));
    setAssignTarget(null);
    setUniQuery('');
    setUniResults([]);
    setSelected(new Set());
  }
  function clearUni(id: string) {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, universityId: null, uniName: null } : p)));
  }

  function updatePackage(idx: number, patch: Partial<PackageDraft>) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  function addPackage() {
    setPackages((prev) => [...prev, emptyPackage()]);
  }
  function removePackage(idx: number) {
    setPackages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
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

  function validate(): string | null {
    if (!title.trim()) return '작품 제목을 입력하세요.';
    if (photos.length === 0) return '사진을 1장 이상 추가하세요.';
    const min = Number(minHead);
    const max = Number(maxHead);
    if (!min || !max) return '촬영 인원(최소·최대)을 입력하세요.';
    if (max < min) return '최대 인원은 최소 인원보다 크거나 같아야 해요.';
    if (packages.length === 0) return '패키지를 1개 이상 추가하세요.';
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
        setProgress(`사진 업로드 중 ${i + 1}/${photos.length}`);
        const item = photos[i]!;
        const fileUrl = await uploadOne(item.file);
        photoList.push({ fileUrl, fileType: 'IMAGE' as const, universityId: item.universityId });
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

  const field = 'w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2.5 text-body-5 text-neutral-950 outline-none focus:border-primary';
  const label = 'mb-1 block text-body-4 text-neutral-800';

  const photoGrid = photos.length > 0 && (
    <div className="mt-2 grid grid-cols-3 gap-2">
      {photos.map((p) => {
        const on = selected.has(p.id);
        return (
          <div key={p.id} className={`relative overflow-hidden rounded-md border ${on ? 'border-primary' : 'border-neutral-200'}`}>
            <img src={p.previewUrl} alt="첨부 사진" className="aspect-square w-full object-cover" />
            <button
              type="button"
              onClick={() => toggleSelect(p.id)}
              aria-label={on ? '사진 선택 해제' : '사진 선택'}
              className={`absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full border text-caption-3 ${on ? 'border-primary bg-primary text-neutral-0' : 'border-neutral-300 bg-neutral-0/80 text-transparent'}`}
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => removePhoto(p.id)}
              aria-label="사진 삭제"
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/60 text-caption-2 text-neutral-0"
            >
              ×
            </button>
            <button
              type="button"
              onClick={() => (p.universityId ? clearUni(p.id) : openAssign([p.id]))}
              className="flex w-full items-center justify-center gap-1 truncate bg-neutral-0 px-1 py-1.5 text-caption-2 text-neutral-700"
            >
              {p.uniName ? `🏫 ${p.uniName} ✕` : '+ 학교 지정'}
            </button>
          </div>
        );
      })}
    </div>
  );

  const assignPanel = assignTarget && (
    <div className="mt-2 rounded-md border border-primary bg-primary-50 p-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-caption-1 text-neutral-700">사진 {assignTarget.length}장에 학교 지정</span>
        <button type="button" onClick={() => setAssignTarget(null)} className="text-caption-1 text-neutral-500 underline">
          닫기
        </button>
      </div>
      <input
        className={field}
        value={uniQuery}
        onChange={(e) => searchUni(e.target.value)}
        placeholder="학교명 검색"
        autoComplete="off"
        autoFocus
      />
      {uniResults.length > 0 && (
        <ul className="mt-1 max-h-48 overflow-y-auto rounded-md border border-neutral-200 bg-neutral-0">
          {uniResults.map((u) => (
            <li key={u.universityId}>
              <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-100" onClick={() => assignUni(u)}>
                <span className="text-body-5 text-neutral-950">{u.name}</span>
                <span className="text-caption-2 text-neutral-500">{u.region}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  const photoSection = (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className={label + ' mb-0'}>사진</span>
        <span className="text-caption-2 text-neutral-400">사진마다 촬영 학교 지정 (선택)</span>
      </div>
      <button
        type="button"
        onClick={() => photoInputRef.current?.click()}
        className="rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2 text-body-5 text-neutral-800 hover:bg-neutral-100"
      >
        + 사진 추가
      </button>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addPhotos(Array.from(e.target.files ?? []));
          e.target.value = '';
        }}
      />
      {photoGrid}
      {selected.size > 0 && (
        <div className="mt-2 flex items-center justify-between">
          <span className="text-caption-1 text-neutral-600">{selected.size}장 선택됨</span>
          <button type="button" onClick={() => openAssign([...selected])} className="rounded-md bg-neutral-800 px-3 py-1.5 text-caption-1 text-neutral-0">
            선택한 사진에 학교 지정
          </button>
        </div>
      )}
      {assignPanel}
    </div>
  );

  const packageSection = (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <span className={label + ' mb-0'}>촬영 구성 (패키지)</span>
        <button type="button" onClick={addPackage} className="text-caption-1 text-primary underline">
          + 패키지 추가
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {packages.map((p, idx) => (
          <div key={idx} className="rounded-lg border border-neutral-200 bg-neutral-0 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-body-6 text-neutral-600">패키지 {idx + 1}</span>
              {packages.length > 1 && (
                <button type="button" onClick={() => removePackage(idx)} className="text-caption-2 text-neutral-500 underline">
                  삭제
                </button>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input className={field} value={p.packageName} onChange={(e) => updatePackage(idx, { packageName: e.target.value })} placeholder="패키지명 (예: 기본)" aria-label="패키지명" />
              <div className="flex gap-2">
                <input type="number" inputMode="numeric" className={field} value={p.price} onChange={(e) => updatePackage(idx, { price: e.target.value })} placeholder="가격(원)" aria-label="가격" />
                <select className={field} value={p.durationMinutes} onChange={(e) => updatePackage(idx, { durationMinutes: e.target.value })} aria-label="촬영 시간">
                  <option value="" disabled>
                    촬영 시간
                  </option>
                  {DURATION_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {fmtDuration(m)}
                    </option>
                  ))}
                </select>
              </div>
              <input type="number" inputMode="numeric" className={field} value={p.finalPhotoCount} onChange={(e) => updatePackage(idx, { finalPhotoCount: e.target.value })} placeholder="보정본 수(장)" aria-label="보정본 수" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div>
        <label className={label} htmlFor="title">
          제목
        </label>
        <input id="title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작품 제목" />
      </div>

      <div>
        <label className={label} htmlFor="description">
          작품 설명 <span className="text-caption-2 text-neutral-400">(선택)</span>
        </label>
        <textarea id="description" rows={3} className={field} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="작품에 대한 설명을 적어주세요." />
      </div>

      <div>
        <label className={label}>촬영 인원</label>
        <div className="flex items-center gap-2">
          <input type="number" inputMode="numeric" min={1} className={field} value={minHead} onChange={(e) => setMinHead(e.target.value)} placeholder="최소" aria-label="최소 인원" />
          <span className="shrink-0 text-body-5 text-neutral-500">~</span>
          <input type="number" inputMode="numeric" min={1} className={field} value={maxHead} onChange={(e) => setMaxHead(e.target.value)} placeholder="최대" aria-label="최대 인원" />
          <span className="shrink-0 text-body-5 text-neutral-600">명</span>
        </div>
      </div>

      {photoSection}

      {packageSection}

      {error && <p className="text-caption-1 text-danger">{error}</p>}
      {progress && <p className="text-caption-1 text-neutral-500">{progress}</p>}

      <button type="submit" disabled={busy} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {busy ? '등록 중…' : '작품 등록'}
      </button>
    </form>
  );
}
