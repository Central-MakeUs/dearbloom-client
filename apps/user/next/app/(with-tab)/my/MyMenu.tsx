'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Card,
} from '@dearbloom/ui';

const rowClass = 'flex h-11 items-center justify-between transition-colors hover:opacity-70';

type Modal = 'logout' | 'withdraw' | null;

export function MyMenu() {
  const [modal, setModal] = useState<Modal>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const logout = () => {
    // 로그아웃 라우트가 세션 무효화 + 쿠키 만료 후 /snaps 로 리다이렉트.
    window.location.href = '/app/api/auth/logout';
  };

  const withdraw = async () => {
    if (isWithdrawing) return;

    setIsWithdrawing(true);
    setWithdrawError('');

    try {
      const response = await fetch('/app/api/auth/withdraw', { method: 'DELETE' });
      if (response.redirected) {
        window.location.assign(response.url);
        return;
      }

      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setWithdrawError(body?.error ?? '회원 탈퇴에 실패했어요. 잠시 후 다시 시도해 주세요.');
    } catch {
      setWithdrawError('네트워크 연결을 확인하고 다시 시도해 주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <>
      <Card className="mt-2 overflow-hidden">
        <nav className="flex flex-col px-5">
          <a href="/app/my/reservations" className={rowClass}>
            <span className="text-body-1 text-neutral-950">예약 내역</span>
            <ChevronRight className="size-6 text-neutral-400" aria-hidden />
          </a>
          <button type="button" onClick={() => setModal('logout')} className={rowClass}>
            <span className="text-body-1 text-neutral-950">로그아웃</span>
            <ChevronRight className="size-6 text-neutral-400" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => {
              setWithdrawError('');
              setModal('withdraw');
            }}
            className={rowClass}
          >
            <span className="text-body-1 text-neutral-950">탈퇴하기</span>
            <ChevronRight className="size-6 text-neutral-400" aria-hidden />
          </button>
        </nav>
      </Card>

      <AlertDialog open={modal === 'logout'} onOpenChange={(open) => !open && setModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃</AlertDialogTitle>
            <AlertDialogDescription>정말 로그아웃 하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={logout}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={modal === 'withdraw'}
        onOpenChange={(open) => {
          if (!open && !isWithdrawing) setModal(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>탈퇴하기</AlertDialogTitle>
            <AlertDialogDescription className={withdrawError ? 'text-danger' : undefined}>
              {withdrawError || '탈퇴하면 모든 계정 정보가 삭제되며 복구할 수 없어요. 정말 탈퇴하시겠습니까?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>취소</AlertDialogCancel>
            <AlertDialogAction
              disabled={isWithdrawing}
              onClick={(event) => {
                event.preventDefault();
                void withdraw();
              }}
            >
              {isWithdrawing ? '처리 중…' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
