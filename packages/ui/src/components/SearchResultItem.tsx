'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';

interface SearchResultItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  /** 1줄 제목. body-1, neutral-800. (매칭 하이라이트는 ReactNode 로 직접 조립) */
  title: ReactNode;
  /** 2줄 보조 설명. body-5, neutral-600. */
  description?: ReactNode;
}

/**
 * item_search_result — 검색 결과 리스트 행.
 * 2줄(제목 body-1 / 설명 body-5), 하단 border, pressed 시 neutral-200 배경.
 */
export const SearchResultItem = forwardRef<HTMLButtonElement, SearchResultItemProps>(
  function SearchResultItem({ title, description, className, ...rest }, ref) {
    const descriptionNode = description ? (
      <span className="text-body-6 text-neutral-600">{description}</span>
    ) : null;

    return (
      <button
        ref={ref}
        type="button"
        {...rest}
        className={cn(
          'flex w-full flex-col items-start gap-1 px-5 py-4 text-left',
          'border-b border-neutral-200 bg-neutral-100 transition-colors',
          'hover:bg-neutral-200 active:bg-neutral-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40',
          'disabled:opacity-40 disabled:pointer-events-none',
          className,
        )}
      >
        <span className="text-body-1 text-neutral-800">{title}</span>
        {descriptionNode}
      </button>
    );
  },
);
