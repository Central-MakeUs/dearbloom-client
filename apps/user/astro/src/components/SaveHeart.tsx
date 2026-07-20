import { useState, type MouseEvent } from 'react';

interface SaveHeartProps {
  artworkId: number;
  initialSaved?: boolean;
  size?: number;
  /** 어두운 배경 위에 올릴 때 등 색 오버라이드 */
  className?: string;
}

/**
 * 작품 저장(찜) 토글 — 클라이언트 island.
 * 같은 도메인 프록시(/api/saved)로 요청(쿠키 자동 전송) → 서버가 Bearer 로 dev-api 호출.
 * 낙관적 업데이트 후 실패 시 롤백. 비로그인(401)이면 로그인 페이지로 유도.
 */
export default function SaveHeart({ artworkId, initialSaved = false, size = 24, className }: SaveHeartProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // 낙관적

    try {
      const res = await fetch('/api/saved', {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId }),
      });
      if (res.status === 401) {
        setSaved(!next);
        window.location.href = '/app';
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSaved(!next); // 롤백
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? '저장 취소' : '저장'}
      className={className ?? 'shrink-0 text-neutral-800 transition-transform active:scale-90'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
