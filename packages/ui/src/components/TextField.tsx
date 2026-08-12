'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../lib/cn';
import { DeleteButton } from './DeleteButton';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** 필드 위 라벨. body-3, neutral-950. */
  label?: ReactNode;
  /** 필드 아래 안내/에러 문구. */
  helper?: ReactNode;
  /** 필드 아래 우측 글자수 카운터(예: `3/5`). */
  counter?: ReactNode;
  /** 에러 상태 — 테두리 danger. */
  error?: boolean;
  /** 좌측 아이콘 슬롯. */
  leading?: ReactNode;
  /** 우측 아이콘 슬롯. 지정 시 자동 clear 버튼 대신 이 노드를 렌더. */
  trailing?: ReactNode;
  /** 지정 시 값이 있을 때 우측에 지우기(clear) 버튼을 렌더. */
  onClear?: () => void;
}

/**
 * textfield — 라벨 + 입력 + 안내문구.
 * default 테두리 없음 / hover primary-400 / focus 브랜드 그린 / error danger.
 * 값이 있고 onClear 가 있으면 우측에 {@link DeleteButton} 을 표시합니다.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, helper, counter, error = false, leading, trailing, onClear, className, disabled, value, id, ...rest },
  ref,
) {
  const hasValue = value != null && value !== '';
  const showClear = !trailing && !!onClear && hasValue && !disabled;

  const labelNode = label ? (
    <label htmlFor={id} className="text-body-4 text-neutral-950">
      {label}
    </label>
  ) : null;

  const field = (
    <div
      className={cn(
        'flex h-14 items-center gap-2 rounded-md bg-neutral-0 px-4',
        'border transition-colors',
        error
          ? 'border-danger'
          : 'border-transparent hover:border-primary-400 focus-within:border-primary',
        disabled && 'opacity-40',
      )}
    >
      {leading}
      <input
        ref={ref}
        id={id}
        value={value}
        disabled={disabled}
        {...rest}
        className={cn(
          'min-w-0 flex-1 bg-transparent text-body-2 text-neutral-950 outline-none',
          'placeholder:text-neutral-500',
        )}
      />
      {trailing}
      {showClear ? <DeleteButton onClick={onClear} tabIndex={-1} /> : null}
    </div>
  );

  // Figma textfield: 라벨↔필드 8px, 필드↔가이드 6px. 가이드는 좌측 안내문 + 우측 카운터.
  const guideNode =
    helper || counter ? (
      <div className="flex items-start gap-4">
        {helper ? (
          <p className={cn('text-caption-2', error ? 'text-danger' : 'text-neutral-500')}>{helper}</p>
        ) : null}
        {counter ? <span className="ml-auto shrink-0 text-caption-2 text-neutral-500">{counter}</span> : null}
      </div>
    ) : null;

  return (
    <div className={cn('flex w-full flex-col gap-1.5', className)}>
      <div className="flex flex-col gap-2">
        {labelNode}
        {field}
      </div>
      {guideNode}
    </div>
  );
});
