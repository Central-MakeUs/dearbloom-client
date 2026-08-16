'use client';

import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '../lib/cn';

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 접근성 제목(스크린리더). 시각적 제목은 children 에서 렌더. */
  title: string;
  children: ReactNode;
  className?: string;
  showHandle?: boolean;
}

/**
 * 바텀시트 실제 구현 — vaul(Drawer) 기반.
 *
 * vaul 은 초기 번들을 무겁게 하므로 여기서 직접 쓰지 말고 지연 로드 래퍼인 `BottomSheet` 를
 * 쓸 것(같은 폴더). 그쪽 주석에 이유가 있다.
 * 드래그 핸들 + 드래그로 닫기 + 스크림.
 * 화면 하단에 max-w-md 로 중앙 정렬되어 모바일 앱처럼 올라온다.
 */
export function BottomSheetImpl({
  open,
  onOpenChange,
  title,
  children,
  className,
  showHandle = true,
}: BottomSheetProps) {
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
          {/* 크기·색은 vaul 기본 스타일이 클래스를 이기므로 ! 로 덮는다. Figma 실측 45x4 / neutral-500. */}
          {showHandle && (
            <Drawer.Handle className="mx-auto mt-3 mb-2 !h-1 !w-[45px] shrink-0 rounded-full !bg-neutral-500" />
          )}
          <Drawer.Title className="sr-only">{title}</Drawer.Title>
          {children}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
