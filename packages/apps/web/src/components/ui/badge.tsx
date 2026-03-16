import { cva, type VariantProps } from 'class-variance-authority';
import { type HTMLAttributes } from 'react';

import { cn } from '../../shared/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary text-secondary-foreground',
        success: 'bg-emerald-500/10 text-emerald-700',
        warning: 'bg-amber-500/15 text-amber-700',
        danger: 'bg-red-500/10 text-red-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
