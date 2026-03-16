import { type HTMLAttributes } from 'react';

import { cn } from '../../shared/lib/utils';

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'danger';
};

export function Alert({ className, variant = 'default', ...props }: AlertProps) {
  return (
    <div
      className={cn(
        'rounded-md border px-4 py-3 text-sm',
        variant === 'danger'
          ? 'border-red-300 bg-red-50 text-red-800'
          : 'border-border bg-muted text-muted-foreground',
        className,
      )}
      role="alert"
      {...props}
    />
  );
}
