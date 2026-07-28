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

  const logout = () => {
    // 로그아웃 라우트가 세션 무효화 + 쿠키 만료 후 /snaps 로 리다이렉트.
    window.location.href = '/app/api/auth/logout';
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
          <button type="button" onClick={() => setModal('withdraw')} className={rowClass}>
            <span className="text-body-1 text-neutral-950">탈퇴하기</span>
            <ChevronRight className="size-6 text-neutral-400" aria-hidden />
          </button>
        </nav>
      </Card>

      <AlertDialog open={modal === 'logout'} onOpenChange={(o) => !o && setModal(null)}>
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

      <AlertDialog open={modal === 'withdraw'} onOpenChange={(o) => !o && setModal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>탈퇴하기</AlertDialogTitle>
            <AlertDialogDescription>정말 탈퇴 하시겠습니까?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            {/* TODO: 회원 탈퇴 API 나오면 연결. 현재는 백엔드 부재로 닫기만. */}
            <AlertDialogAction onClick={() => setModal(null)}>확인</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
