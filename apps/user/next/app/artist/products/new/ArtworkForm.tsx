'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { University } from '@dearbloom/shared';

interface PackageDraft {
  packageName: string;
  price: string;
  durationMinutes: string;
  finalPhotoCount: string;
  extraInfo: string;
}

const emptyPackage = (): PackageDraft => ({ packageName: '', price: '', durationMinutes: '', finalPhotoCount: '', extraInfo: '' });

export function ArtworkForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [minHead, setMinHead] = useState('1');
  const [maxHead, setMaxHead] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uniQuery, setUniQuery] = useState('');
  const [uniResults, setUniResults] = useState<University[]>([]);
  const [uni, setUni] = useState<University | null>(null);
  const [packages, setPackages] = useState<PackageDraft[]>([emptyPackage()]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

  function updatePackage(idx: number, patch: Partial<PackageDraft>) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  }
  function addPackage() {
    setPackages((prev) => [...prev, emptyPackage()]);
  }
  function removePackage(idx: number) {
    setPackages((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== idx)));
  }

  async function searchUni(q: string) {
    setUniQuery(q);
    setUni(null);
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
    if (!uni) return '촬영 학교를 선택하세요.';
    if (files.length === 0) return '사진을 1장 이상 선택하세요.';
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
      for (let i = 0; i < files.length; i += 1) {
        setProgress(`사진 업로드 중 ${i + 1}/${files.length}`);
        const fileUrl = await uploadOne(files[i]!);
        photoList.push({ fileUrl, fileType: 'IMAGE' as const, universityId: uni!.universityId });
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
            extraInfo: p.extraInfo.trim() || undefined,
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

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div>
        <label className={label} htmlFor="title">제목</label>
        <input id="title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="작품 제목" />
      </div>

      <div>
        <label className={label} htmlFor="description">작품 설명 <span className="text-caption-2 text-neutral-400">(선택)</span></label>
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

      <div>
        <label className={label} htmlFor="uni">촬영 학교</label>
        {uni ? (
          <div className="flex items-center justify-between rounded-md border border-primary bg-primary-50 px-3 py-2.5">
            <span className="text-body-5 text-neutral-950">{uni.name} <span className="text-caption-2 text-neutral-500">{uni.region}</span></span>
            <button type="button" className="text-caption-1 text-neutral-500 underline" onClick={() => { setUni(null); setUniQuery(''); }}>변경</button>
          </div>
        ) : (
          <>
            <input id="uni" className={field} value={uniQuery} onChange={(e) => searchUni(e.target.value)} placeholder="학교명 검색" autoComplete="off" />
            {uniResults.length > 0 && (
              <ul className="mt-1 max-h-48 overflow-y-auto rounded-md border border-neutral-200 bg-neutral-0">
                {uniResults.map((u) => (
                  <li key={u.universityId}>
                    <button type="button" className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-neutral-100" onClick={() => { setUni(u); setUniResults([]); }}>
                      <span className="text-body-5 text-neutral-950">{u.name}</span>
                      <span className="text-caption-2 text-neutral-500">{u.region}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>

      <div>
        <label className={label} htmlFor="photos">사진</label>
        <input id="photos" type="file" accept="image/*" multiple className={field} onChange={(e) => setFiles(Array.from(e.target.files ?? []))} />
        {files.length > 0 && <p className="mt-1 text-caption-2 text-neutral-500">{files.length}장 선택됨</p>}
      </div>

      {/* 촬영 구성(패키지) — 1개 이상 필수 */}
      <div>
        <div className="mb-1 flex items-center justify-between">
          <span className={label + ' mb-0'}>촬영 구성 (패키지)</span>
          <button type="button" onClick={addPackage} className="text-caption-1 text-primary underline">+ 패키지 추가</button>
        </div>
        <div className="flex flex-col gap-3">
          {packages.map((p, idx) => (
            <div key={idx} className="rounded-lg border border-neutral-200 bg-neutral-0 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-body-6 text-neutral-600">패키지 {idx + 1}</span>
                {packages.length > 1 && (
                  <button type="button" onClick={() => removePackage(idx)} className="text-caption-2 text-neutral-500 underline">삭제</button>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input className={field} value={p.packageName} onChange={(e) => updatePackage(idx, { packageName: e.target.value })} placeholder="패키지명 (예: 기본)" aria-label="패키지명" />
                <div className="flex gap-2">
                  <input type="number" inputMode="numeric" className={field} value={p.price} onChange={(e) => updatePackage(idx, { price: e.target.value })} placeholder="가격(원)" aria-label="가격" />
                  <input type="number" inputMode="numeric" className={field} value={p.durationMinutes} onChange={(e) => updatePackage(idx, { durationMinutes: e.target.value })} placeholder="촬영 시간(분)" aria-label="촬영 시간(분)" />
                </div>
                <div className="flex gap-2">
                  <input type="number" inputMode="numeric" className={field} value={p.finalPhotoCount} onChange={(e) => updatePackage(idx, { finalPhotoCount: e.target.value })} placeholder="보정본 수(장)" aria-label="보정본 수" />
                  <input className={field} value={p.extraInfo} onChange={(e) => updatePackage(idx, { extraInfo: e.target.value })} placeholder="추가 안내(선택)" aria-label="추가 안내" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-caption-1 text-danger">{error}</p>}
      {progress && <p className="text-caption-1 text-neutral-500">{progress}</p>}

      <button type="submit" disabled={busy} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {busy ? '등록 중…' : '작품 등록'}
      </button>
    </form>
  );
}
