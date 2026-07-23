'use client';

import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '../lib/cn';

interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 접근성 제목(스크린리더). 시각적 제목은 children 에서 렌더. */
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * 하단 바텀시트 — vaul(Drawer) 기반. 드래그 핸들 + 드래그로 닫기 + 스크림.
 * 화면 하단에 max-w-md 로 중앙 정렬되어 모바일 앱처럼 올라온다.
 */
export function BottomSheet({ open, onOpenChange, title, children, className }: BottomSheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-neutral-950/50" />
        <Drawer.Content
          className={cn(
            'fixed inset-x-0 bottom-0 z-[70] mx-auto flex max-h-[85vh] max-w-md flex-col rounded-t-xl bg-neutral-0 pb-8 outline-none',
            className,
          )}
        >
          <Drawer.Handle className="mx-auto mt-3 mb-2 h-1 w-10 shrink-0 rounded-full bg-neutral-300" />
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
