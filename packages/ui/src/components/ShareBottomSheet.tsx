'use client';

import { Link, MoreHorizontal, X } from 'lucide-react';
import { BottomSheet } from './BottomSheet';
import { Spinner } from './Spinner';
import { Button } from './ui/button';

interface ShareBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showKakao: boolean;
  loading?: boolean;
  kakaoIconSrc: string;
  onCopy: () => void;
  onKakao: () => void;
  onMore: () => void;
}

export function ShareBottomSheet({
  open,
  onOpenChange,
  showKakao,
  loading = false,
  kakaoIconSrc,
  onCopy,
  onKakao,
  onMore,
}: ShareBottomSheetProps) {
  const optionClass =
    'flex w-20 flex-col items-center gap-2 rounded-xl px-3 py-2 text-body-5 text-neutral-950 disabled:opacity-40';

  // 공유가 도는 동안 버튼은 disabled 로 흐려지기만 해서 눌린 건지 알 수 없었다 — 위에 스피너를 겹쳐 둔다.
  const overlay = loading ? (
    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Spinner className="size-8" label="공유하는 중" />
    </span>
  ) : null;

  const options = (
    <div
      className="relative flex h-[143px] items-start justify-center gap-4 pt-3.5"
      aria-busy={loading}
    >
      <button type="button" className={optionClass} onClick={onCopy} disabled={loading}>
        <span className="flex size-14 items-center justify-center rounded-full bg-primary text-neutral-0">
          <Link className="size-8" strokeWidth={2} aria-hidden />
        </span>
        <span>링크복사</span>
      </button>
      {showKakao ? (
        <button type="button" className={optionClass} onClick={onKakao} disabled={loading}>
          <img src={kakaoIconSrc} alt="" className="size-14 rounded-full" />
          <span>카카오톡</span>
        </button>
      ) : null}
      <button type="button" className={optionClass} onClick={onMore} disabled={loading}>
        <span className="flex size-14 items-center justify-center rounded-full bg-neutral-400 text-neutral-0">
          <MoreHorizontal className="size-8" strokeWidth={2.5} aria-hidden />
        </span>
        <span>더보기</span>
      </button>
      {overlay}
    </div>
  );

  const header = (
    <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-5">
      <h2 className="text-head-3 text-neutral-950">공유하기</h2>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onOpenChange(false)}
        aria-label="닫기"
        className="size-10 rounded-full bg-neutral-200 text-neutral-600 hover:bg-neutral-300"
      >
        <X className="size-[26px]" strokeWidth={1.5} />
      </Button>
    </div>
  );

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="공유하기"
      className="pb-0"
      showHandle={false}
    >
      {header}
      {options}
    </BottomSheet>
  );
}
