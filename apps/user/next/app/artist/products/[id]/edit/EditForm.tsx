'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export function EditForm({ id, title: initialTitle, price: initialPrice }: { id: number; title: string; price: number }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [price, setPrice] = useState(String(initialPrice));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim() || !price) {
      setError('제목과 가격을 입력하세요.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/app/api/artist/artworks?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), price: Number(price) }),
      });
      if (res.status === 401) {
        window.location.href = '/app/dev/login';
        return;
      }
      if (!res.ok) {
        const b = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(b.error || '수정 실패');
      }
      router.push('/app/artist/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했어요');
    } finally {
      setBusy(false);
    }
  }

  const field = 'w-full rounded-md border border-neutral-300 bg-neutral-0 px-3 py-2.5 text-body-5 text-neutral-950 outline-none focus:border-primary';
  const label = 'mb-1 block text-body-4 text-neutral-800';

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5 px-4 py-5">
      <div>
        <label className={label} htmlFor="title">제목</label>
        <input id="title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div>
        <label className={label} htmlFor="price">가격 (원)</label>
        <input id="price" type="number" inputMode="numeric" className={field} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      <p className="text-caption-2 text-neutral-500">사진 변경은 추후 지원 예정이에요.</p>
      {error && <p className="text-caption-1 text-danger">{error}</p>}
      <button type="submit" disabled={busy} className="mt-2 flex h-[52px] w-full items-center justify-center rounded-md bg-primary text-body-1 text-neutral-0 disabled:opacity-50">
        {busy ? '저장 중…' : '저장'}
      </button>
    </form>
  );
}
