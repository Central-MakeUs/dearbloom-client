import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva('inline-flex items-center rounded-sm px-1.5 py-0.5 text-caption-2 font-medium', {
  variants: {
    variant: {
      default: 'bg-neutral-100 text-neutral-600',
      primary: 'bg-primary-50 text-primary',
      success: 'bg-success/10 text-success',
      danger: 'bg-danger/10 text-danger',
      muted: 'bg-neutral-200 text-neutral-500',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { badgeVariants };
