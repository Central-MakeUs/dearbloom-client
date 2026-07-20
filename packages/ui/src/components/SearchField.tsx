'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { TextField } from './TextField';
import { DeleteButton } from './DeleteButton';

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: boolean;
  /** 값이 있을 때 우측 지우기 버튼이 눌리면 호출. */
  onClear?: () => void;
}

/**
 * textfield_school — 검색용 텍스트필드.
 * 비어있으면 우측에 검색(Research) 아이콘, 값이 있으면 좌측 검색 아이콘 + 우측 지우기 버튼.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { value, onClear, className, disabled, ...rest },
  ref,
) {
  const hasValue = value != null && value !== '';

  const leading = hasValue ? <SearchIcon size={20} className="text-neutral-500" /> : undefined;
  const trailing = hasValue ? (
    onClear ? <DeleteButton onClick={onClear} tabIndex={-1} /> : undefined
  ) : (
    <SearchIcon size={22} className="text-neutral-500" />
  );

  return (
    <TextField
      ref={ref}
      value={value}
      disabled={disabled}
      leading={leading}
      trailing={trailing}
      className={className}
      {...rest}
    />
  );
});

function SearchIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn('shrink-0', className)}
    >
      <circle cx={11} cy={11} r={7} />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
