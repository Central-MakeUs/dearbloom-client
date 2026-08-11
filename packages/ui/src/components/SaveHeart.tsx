'use client';

import { useState, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { LoginRequiredDialog } from './LoginRequiredDialog';

interface SaveHeartProps {
  artworkId: number;
  initialSaved?: boolean;
  size?: number;
  /** 하트 외곽선 두께. Figma 카드 오버레이는 1.5. */
  strokeWidth?: number;
  /** 어두운 배경 위에 올릴 때 등 색 오버라이드 */
  className?: string;
  /** 토글 결과 콜백(낙관적/롤백 포함한 최종 상태). 목록에서 언세이브 시 제거용. */
  onChange?: (saved: boolean) => void;
  /**
   * 저장 프록시 엔드포인트. 앱별 basePath 차이 대응.
   * astro(루트) '/api/saved' 기본값, next(basePath '/app')는 '/app/api/saved' 를 넘기세요.
   */
  endpoint?: string;
  /**
   * 비로그인(401)일 때 이동할 로그인 경로. 기본 '/app/login'(astro/next 공용).
   */
  loginHref?: string;
  /**
   * 로그인 후 돌아올 경로. 기본은 현재 주소 —
   * 목록에서 누른 하트를 작품 상세로 되돌리고 싶을 때처럼 다른 곳을 지정할 수 있습니다.
   */
  loginRedirectUri?: string;
}

/**
 * 작품 저장(찜) 토글 — 클라이언트 island. astro/next 공용.
 * 같은 도메인 프록시(endpoint)로 요청(쿠키 자동 전송) → 서버가 Bearer 로 백엔드 호출.
 * 낙관적 업데이트 후 실패 시 롤백. 비로그인(401)이면 로그인 페이지로 유도.
 */
export function SaveHeart({
  artworkId,
  initialSaved = false,
  size = 24,
  strokeWidth = 1.8,
  className,
  onChange,
  endpoint = '/api/saved',
  loginHref = '/app/login',
  loginRedirectUri,
}: SaveHeartProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  // 비로그인으로 저장을 누른 상태. 바로 로그인 화면으로 튕기지 않고 물어본 뒤 보낸다.
  const [loginAsked, setLoginAsked] = useState(false);

  async function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    const next = !saved;
    setSaved(next); // 낙관적
    onChange?.(next);

    try {
      const res = await fetch(endpoint, {
        method: next ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artworkId }),
      });
      if (res.status === 401) {
        setSaved(!next);
        onChange?.(!next);
        setLoginAsked(true);
        return;
      }
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      setSaved(!next); // 롤백
      onChange?.(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? '저장 취소' : '저장'}
        className={className ?? 'shrink-0 text-neutral-800 transition-transform active:scale-90'}
      >
        <Heart size={size} strokeWidth={strokeWidth} fill={saved ? 'currentColor' : 'none'} aria-hidden />
      </button>
      <LoginRequiredDialog
        open={loginAsked}
        onOpenChange={setLoginAsked}
        redirectUri={loginRedirectUri}
        loginHref={loginHref}
      />
    </>
  );
}
