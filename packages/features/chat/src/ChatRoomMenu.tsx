'use client';

import { Fragment } from 'react';
import { BottomSheet } from '@dearbloom/ui';

/** Figma 1105:16298 의 메뉴 항목. 셋 다 아직 백엔드 API 가 없다. */
const MENU_ITEMS = ['채팅 알림 끄기', '신고하기', '채팅방 나가기'] as const;

interface ChatRoomMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 항목 선택 — 백엔드가 붙기 전까지는 '준비 중' 안내로 수렴한다. */
  onSelect: (label: string) => void;
}

/**
 * 채팅방 ⋯ 메뉴 바텀시트.
 *
 * Figma 1105:16298 실측 — 시트 radius 12(상단), 항목 3개(Body1_m_16/neutral-900),
 * 항목 사이 neutral-200 1px 구분선, 위아래 여백 16, 시트 하단 여백 24.
 * 구분선은 좌우 8, 항목은 좌우 23 에서 시작한다.
 */
export function ChatRoomMenu({ open, onOpenChange, onSelect }: ChatRoomMenuProps) {
  const items = MENU_ITEMS.map((label, index) => (
    <Fragment key={label}>
      {index > 0 && <span className="h-px bg-neutral-200" aria-hidden />}
      <button
        type="button"
        onClick={() => onSelect(label)}
        className="px-[15px] text-left text-body-1 text-neutral-900"
      >
        {label}
      </button>
    </Fragment>
  ));

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title="채팅방 메뉴" className="rounded-t-lg pb-6">
      {/* 핸들 아래 여백이 Figma 기준 35 라 시트 기본(24) 에 11 을 더한다. */}
      <div className="flex flex-col gap-4 px-2 pt-[11px]">{items}</div>
    </BottomSheet>
  );
}
