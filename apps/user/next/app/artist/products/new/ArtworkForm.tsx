'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { University } from '@dearbloom/shared';

export function ArtworkForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [uniQuery, setUniQuery] = useState('');
  const [uniResults, setUniResults] = useState<University[]>([]);
  const [uni, setUni] = useState<University | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState('');

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !price || !uni || files.length === 0) {
      setError('제목·가격·학교·사진을 모두 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      const photoList = [];
      for (let i = 0; i < files.length; i += 1) {
        setProgress(`사진 업로드 중 ${i + 1}/${files.length}`);
        const fileUrl = await uploadOne(files[i]!);
        photoList.push({ fileUrl, fileType: 'IMAGE' as const, universityId: uni.universityId });
      }
      setProgress('작품 등록 중…');
      const res = await fetch('/app/api/artist/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), price: Number(price), photoList }),
      });
      if (res.status === 401) {
        window.location.href = '/app/dev/login';
        return;
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error || '작품 등록 실패');
      }
      router.push('/app/artist/products');
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
        <label className={label} htmlFor="price">가격 (원)</label>
        <input id="price" type="number" inputMode="numeric" className={field} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150000" />
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

      {error && <p className="text-caption-1 text-danger">{error}</p>}
      {progress && <p className="text-caption-1 text-neutral-500">{progress}</p>}

      <button type="submit" disabled={busy} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {busy ? '등록 중…' : '작품 등록'}
      </button>
    </form>
  );
}
