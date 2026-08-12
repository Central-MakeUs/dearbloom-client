'use client';

import { useState } from 'react';

import { ConfirmDialog } from './ConfirmDialog';
import { MyMenuRow } from './MyMenuRow';

export function MemberLogoutButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <MyMenuRow label="로그아웃" onClick={() => setIsOpen(true)} />
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
