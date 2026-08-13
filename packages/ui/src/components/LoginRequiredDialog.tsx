'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';

export interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * 로그인 후 돌아올 경로. 같은 오리진 내부 경로여야 합니다('/snaps/12' 처럼).
   * 넘기지 않으면 모달이 열린 시점의 현재 주소(pathname + search)로 돌아옵니다.
   */
  redirectUri?: string;
  /** 로그인 페이지 경로. astro(루트)·next(basePath '/app') 모두 이 절대 경로를 씁니다. */
  loginHref?: string;
  title?: string;
  description?: string;
}

/**
 * 로그인이 필요한 동작(저장·문의 등)에서 띄우는 확인 모달 — Figma 2058:18540.
 *
 * 곧장 로그인 화면으로 튕기면 보던 맥락이 끊기므로, 한 번 물어보고 확인에서만 이동합니다.
 * 이동할 때 돌아올 곳을 returnUrl 로 실어 보냅니다.
 */
export function LoginRequiredDialog({
  open,
  onOpenChange,
  redirectUri,
  loginHref = '/app/login',
  title = '로그인이 필요합니다',
  description = '로그인 하시겠습니까?',
}: LoginRequiredDialogProps) {
  function goLogin() {
    const returnUrl = redirectUri ?? window.location.pathname + window.location.search;
    window.location.href = `${loginHref}?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {/* 카드 전체가 링크인 자리에서도 쓰이므로 모달 안 클릭이 링크로 새지 않게 막는다. */}
      <AlertDialogContent className="max-w-xs" onClick={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel className="flex-1">취소</AlertDialogCancel>
          <AlertDialogAction className="flex-1" onClick={goLogin}>
            확인
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
