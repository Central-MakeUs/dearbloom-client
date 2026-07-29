'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

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
        <ChevronRight className="size-6 text-neutral-400" aria-hidden />
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
