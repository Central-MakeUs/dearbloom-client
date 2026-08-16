'use client';

import { useState, type MouseEvent } from 'react';
import { Heart } from 'lucide-react';
import { cn } from '../lib/cn';
import { LoginRequiredDialog } from './LoginRequiredDialog';

interface SaveHeartProps {
  artworkId: number;
  initialSaved?: boolean;
  size?: number;
  /** 하트 외곽선 두께. Figma 카드 오버레이는 1.5. */
  strokeWidth?: number;
  /** 어두운 배경 위에 올릴 때 등 색 오버라이드 */
  className?: string;
  /** 미저장 상태에만 사용할 Figma 아이콘. 저장 상태의 기존 빨간 하트는 유지한다. */
  unsavedIconSrc?: string;
  /** 24px 아이콘 컨테이너 안 Figma Vector 실측 위치·크기. */
  unsavedIconClassName?: string;
  /** 저장 상태에 사용할 Figma 아이콘. */
  savedIconSrc?: string;
  savedIconClassName?: string;
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
  /** 고객 프로필을 만들러 보낼 경로(작가 전용 계정이 저장을 눌렀을 때). */
  customerOnboardingHref?: string;
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
  unsavedIconSrc,
  unsavedIconClassName,
  savedIconSrc,
  savedIconClassName,
  onChange,
  endpoint = '/api/saved',
  loginHref = '/app/login',
  loginRedirectUri,
  customerOnboardingHref = '/app/onboarding',
}: SaveHeartProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState(false);
  // 저장이 막힌 이유. login = 아직 로그인 안 함, customer = 로그인은 했지만 고객 프로필이 없음.
  const [blockedBy, setBlockedBy] = useState<'login' | 'customer' | null>(null);

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
      // 401 은 비로그인, 403 은 로그인은 했지만 고객 프로필이 없는 경우다.
      // 후자에 로그인 모달을 띄우면 "이미 로그인했는데 또 로그인하라" 는 화면이 된다.
      if (res.status === 401 || res.status === 403) {
        setSaved(!next);
        onChange?.(!next);
        setBlockedBy(res.status === 401 ? 'login' : 'customer');
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

  const iconSrc = saved ? savedIconSrc : unsavedIconSrc;
  const iconClassName = saved ? savedIconClassName : unsavedIconClassName;
  const icon = iconSrc ? (
    <span className="relative block size-6 overflow-hidden" aria-hidden>
      <img src={iconSrc} alt="" className={cn('absolute max-w-none', iconClassName)} />
    </span>
  ) : (
    <Heart size={size} strokeWidth={strokeWidth} fill={saved ? 'currentColor' : 'none'} aria-hidden />
  );

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={saved}
        aria-label={saved ? '저장 취소' : '저장'}
        className={className ?? 'shrink-0 text-neutral-800 transition-transform active:scale-90'}
      >
        {icon}
      </button>
      <LoginRequiredDialog
        open={blockedBy === 'login'}
        onOpenChange={(open) => !open && setBlockedBy(null)}
        redirectUri={loginRedirectUri}
        loginHref={loginHref}
      />
      <LoginRequiredDialog
        open={blockedBy === 'customer'}
        onOpenChange={(open) => !open && setBlockedBy(null)}
        redirectUri={loginRedirectUri}
        loginHref={customerOnboardingHref}
        title="고객 프로필이 필요합니다"
        description="프로필을 만들면 작품을 저장할 수 있어요."
      />
    </>
  );
}
