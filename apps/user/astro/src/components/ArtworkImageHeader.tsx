import type { ReactNode } from 'react';
import { cn } from '@dearbloom/ui';

interface Props {
  backHref: string;
  title?: string;
  right?: ReactNode;
  className?: string;
}

export function ArtworkImageHeader({ backHref, title, right, className }: Props) {
  const backButton = (
    <a href={backHref} aria-label="뒤로가기" className="flex size-11 items-center justify-center">
      <img src="/images/image-detail-back.svg" alt="" className="size-7" aria-hidden />
    </a>
  );
  const titleNode = title ? (
    <h1 className="pointer-events-none absolute inset-x-0 mx-auto w-max text-head-3 text-neutral-950">
      {title}
    </h1>
  ) : null;
  const rightNode = right ? <div className="ml-auto flex h-12 items-center pr-3">{right}</div> : null;

  return (
    <header className={cn('relative z-20 flex h-[52px] items-center bg-neutral-100 px-1', className)}>
      {backButton}
      {titleNode}
      {rightNode}
    </header>
  );
}
