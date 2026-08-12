'use client';

import * as React from 'react';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

/**
 * modal — Figma 실측: 폭 303, radius 8, padding 16, 오버레이 neutral-950 70%.
 * 본문(타이틀+설명)은 가운데 정렬, 버튼은 높이 48 / radius 6 의 2분할.
 */
export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-950/70 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed left-1/2 top-1/2 z-50 flex w-[303px] max-w-[calc(100%-2.5rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-md bg-neutral-0 p-4 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

export function AlertDialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2 pb-6 pt-3 text-center', className)} {...props} />;
}

export function AlertDialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-row gap-2', className)} {...props} />;
}

export const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title ref={ref} className={cn('text-head-3 text-neutral-950', className)} {...props} />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

export const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description ref={ref} className={cn('text-body-6 text-neutral-800', className)} {...props} />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

/** btn_modal_2option — 모달 하단 버튼. 두 개가 남은 폭을 반씩 나눠 갖습니다. */
const modalButtonVariants = cva(
  'flex h-12 flex-1 items-center justify-center rounded-[6px] text-body-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-neutral-0 hover:bg-primary-hover',
        danger: 'bg-danger text-neutral-0 hover:opacity-90',
        cancel: 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
);

/**
 * 실행 버튼. 되돌릴 수 없는 행동이면 `variant="danger"` 를 쓰세요.
 *
 * variant 는 prop 으로 받습니다 — `className` 에 배경색만 겹쳐 넘기면
 * `hover:bg-primary-hover` 는 그대로 남아 hover 시 색이 튑니다.
 */
export const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action> &
    Pick<VariantProps<typeof modalButtonVariants>, 'variant'>
>(({ className, variant, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(modalButtonVariants({ variant }), className)}
    {...props}
  />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

export const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(modalButtonVariants({ variant: 'cancel' }), className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;
