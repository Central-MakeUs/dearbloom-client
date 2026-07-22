'use client';

import { useState } from 'react';

const ChevronRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className="text-neutral-400"
  >
    <path d="m9 18 6-6-6-6" />
  </svg>
);

/** 취소/확인 2버튼 확인 모달 (Figma 로그아웃·탈퇴 모달 공통 스펙) */
function ConfirmModal({
  title,
  message,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal>
      <button type="button" aria-label="닫기" className="absolute inset-0 bg-neutral-950/70" onClick={onCancel} />
      <div className="relative w-[303px] rounded-md bg-neutral-0 p-4">
        <div className="flex flex-col items-center gap-2.5 pb-6 pt-3">
          <h2 className="text-head-3 text-neutral-950">{title}</h2>
          <p className="text-center text-body-6 text-neutral-800">{message}</p>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 rounded-[6px] bg-neutral-200 text-body-1 text-neutral-800"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-12 flex-1 rounded-[6px] bg-primary text-body-1 text-neutral-0"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

type Modal = 'logout' | 'withdraw' | null;

export function MyMenu() {
  const [modal, setModal] = useState<Modal>(null);

  const logout = () => {
    // 로그아웃 라우트가 세션 무효화 + 쿠키 만료 후 /snaps 로 리다이렉트.
    window.location.href = '/app/api/auth/logout';
  };

  return (
    <>
      <nav className="mt-2 flex flex-col gap-1 px-5">
        <a href="/app/my/reservations" className="flex h-11 items-center justify-between transition-colors hover:opacity-70">
          <span className="text-body-1 text-neutral-950">예약 내역</span>
          <ChevronRight />
        </a>
        <button
          type="button"
          onClick={() => setModal('logout')}
          className="flex h-11 items-center justify-between transition-colors hover:opacity-70"
        >
          <span className="text-body-1 text-neutral-950">로그아웃</span>
          <ChevronRight />
        </button>
        <button
          type="button"
          onClick={() => setModal('withdraw')}
          className="flex h-11 items-center justify-between transition-colors hover:opacity-70"
        >
          <span className="text-body-1 text-neutral-950">탈퇴하기</span>
          <ChevronRight />
        </button>
      </nav>

      {modal === 'logout' && (
        <ConfirmModal
          title="로그아웃"
          message="정말 로그아웃 하시겠습니까?"
          onCancel={() => setModal(null)}
          onConfirm={logout}
        />
      )}
      {modal === 'withdraw' && (
        <ConfirmModal
          title="탈퇴하기"
          message="정말 탈퇴 하시겠습니까?"
          onCancel={() => setModal(null)}
          // TODO: 회원 탈퇴 API 나오면 연결. 현재는 백엔드 부재로 닫기만.
          onConfirm={() => setModal(null)}
        />
      )}
    </>
  );
}
