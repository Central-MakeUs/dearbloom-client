import * as React from 'react';
import { cn } from '../../lib/cn';
import { Label } from './label';

export interface FieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  optional?: boolean;
  error?: string | null;
  helper?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** label + control + helper/error 를 묶는 폼 필드 래퍼. */
export function Field({ label, htmlFor, optional, error, helper, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label != null && (
        <Label htmlFor={htmlFor}>
          {label}
          {optional && <span className="ml-1 text-caption-2 text-neutral-400">(선택)</span>}
        </Label>
      )}
      {children}
      {error ? (
        <p className="text-caption-1 text-danger">{error}</p>
      ) : helper != null ? (
        <p className="text-caption-2 text-neutral-500">{helper}</p>
      ) : null}
    </div>
  );
}
