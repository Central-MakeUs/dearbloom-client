'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ARTIST_REGION_OPTIONS, type ArtistMe, type ArtistRegionCode } from '@dearbloom/shared';

export function ProfileForm({ initial }: { initial: ArtistMe }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(initial.nickname ?? '');
  const [intro, setIntro] = useState(initial.intro ?? '');
  const [regions, setRegions] = useState<ArtistRegionCode[]>(initial.regionList ?? []);
  const [travelFeeInfo, setTravel] = useState(initial.travelFeeInfo ?? '');
  const [packageInfo, setPackage] = useState(initial.packageInfo ?? '');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setMsg('');
    setBusy(true);
    try {
      const patch: {
        nickname: string;
        intro: string;
        regionList: ArtistRegionCode[];
        travelFeeInfo: string;
        packageInfo: string;
        artistImageUrl?: string;
      } = { nickname: nickname.trim(), intro, regionList: regions, travelFeeInfo, packageInfo };
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
      setMsg('저장되었습니다.');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요');
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2.5 text-body-4 text-neutral-950 outline-none focus:border-primary';
  const label = 'mb-1 block text-body-3 text-neutral-800';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div>
        <label className={label} htmlFor="nickname">닉네임</label>
        <input id="nickname" className={field} value={nickname} onChange={(e) => setNickname(e.target.value)} />
      </div>

      <div>
        <label className={label} htmlFor="intro">작가 소개</label>
        <textarea id="intro" rows={4} className={field} value={intro} onChange={(e) => setIntro(e.target.value)} placeholder="작가님을 소개해주세요" />
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
        <label className={label} htmlFor="travel">출장비 안내</label>
        <input id="travel" className={field} value={travelFeeInfo} onChange={(e) => setTravel(e.target.value)} placeholder="예: 지역별 2~5만원" />
      </div>

      <div>
        <label className={label} htmlFor="package">촬영 구성/패키지</label>
        <textarea id="package" rows={4} className={field} value={packageInfo} onChange={(e) => setPackage(e.target.value)} placeholder="촬영 시간, 원본/보정본 수 등" />
      </div>

      <div>
        <label className={label} htmlFor="image">대표 이미지</label>
        {initial.imageUrl && !imageFile && <img src={initial.imageUrl} alt="현재 대표 이미지" className="mb-2 h-20 w-20 rounded-full object-cover" />}
        <input id="image" type="file" accept="image/*" className={field} onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
      </div>

      {error && <p className="text-caption-1 text-danger">{error}</p>}
      {msg && <p className="text-caption-1 text-success">{msg}</p>}

      <button type="submit" disabled={busy} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {busy ? '저장 중…' : '저장'}
      </button>
    </form>
  );
}
