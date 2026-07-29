'use client';

import { useState } from 'react';

import { ConfirmDialog } from './ConfirmDialog';

export function MemberLogoutButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="flex h-11 items-center justify-between transition-colors hover:opacity-70"
        onClick={() => setIsOpen(true)}
        type="button"
      >
        <span className="text-body-1 text-neutral-950">로그아웃</span>
        <svg
          aria-hidden
          className="text-neutral-400"
          fill="none"
          height="24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      <ConfirmDialog
        isOpen={isOpen}
        message="정말 로그아웃 하시겠습니까?"
        onCancel={() => setIsOpen(false)}
        onConfirm={() => {
          window.location.href = '/app/api/auth/logout';
        }}
        title="로그아웃"
      />
    </>
  );
}
