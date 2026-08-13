'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogTitle } from '@dearbloom/ui';

interface ChatImagePreviewProps {
  src: string;
  /** 말풍선 안에서의 썸네일 클래스. */
  className?: string;
}

/**
 * 채팅 사진 — 탭하면 전체화면으로 크게 본다.
 *
 * 사진 첨부 자체가 Figma 에 없어 뷰어도 시안이 없다. 사진이 주인공이 되도록
 * 불투명 검정 배경 + object-contain 으로만 두고 장식은 넣지 않았다.
 * ESC·스크롤 잠금·포커스 트랩은 Radix Dialog 가 처리한다.
 */
export function ChatImagePreview({ src, className }: ChatImagePreviewProps) {
  const [open, setOpen] = useState(false);

  const thumbnail = (
    <button type="button" aria-label="사진 크게 보기" onClick={() => setOpen(true)} className="block">
      <img src={src} alt="보낸 사진" className={className} />
    </button>
  );

  const viewer = (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        hideClose
        className="inset-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 bg-neutral-950 p-0 shadow-none"
      >
        <DialogTitle className="sr-only">보낸 사진</DialogTitle>

        {/* 전체화면에는 '바깥'이 없으므로 사진을 포함해 아무 데나 탭하면 닫는다. */}
        <DialogClose asChild>
          <div className="flex h-full w-full items-center justify-center">
            <img src={src} alt="보낸 사진" className="max-h-dvh max-w-full object-contain" />
          </div>
        </DialogClose>

        <DialogClose
          aria-label="닫기"
          className="absolute right-1 top-[calc(4px+env(safe-area-inset-top))] flex h-11 w-11 items-center justify-center text-neutral-0"
        >
          <X size={24} strokeWidth={2} aria-hidden />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      {thumbnail}
      {viewer}
    </>
  );
}
