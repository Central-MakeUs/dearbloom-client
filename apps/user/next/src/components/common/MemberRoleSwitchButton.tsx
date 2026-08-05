'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

import type { MemberRole } from '@dearbloom/shared';

import { requestMemberRoleSwitch } from '@/src/lib/memberRoleSwitch';

const labels: Record<MemberRole, string> = {
  ARTIST: '작가 계정으로 전환',
  CUSTOMER: '모델 계정으로 전환',
};

export function MemberRoleSwitchButton({ targetRole }: { targetRole: MemberRole }) {
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState('');

  const switchRole = async () => {
    if (isSwitching) return;

    setIsSwitching(true);
    setError('');

    try {
      window.location.replace(await requestMemberRoleSwitch(targetRole));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '역할을 전환하지 못했습니다.');
      setIsSwitching(false);
    }
  };

  const errorMessage = error ? (
    <p className="pb-2 text-caption-1 text-danger" role="alert">
      {error}
    </p>
  ) : null;

  return (
    <>
      <button
        aria-busy={isSwitching}
        className="flex h-11 items-center justify-between transition-colors hover:opacity-70 disabled:opacity-50"
        disabled={isSwitching}
        onClick={() => void switchRole()}
        type="button"
      >
        <span className="text-body-1 text-neutral-950">
          {isSwitching ? '전환 중…' : labels[targetRole]}
        </span>
        <ChevronRight aria-hidden className="size-6 text-neutral-400" />
      </button>
      {errorMessage}
    </>
  );
}
