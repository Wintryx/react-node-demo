import { LoaderCircle } from 'lucide-react';

import { cn } from '../../shared/lib/utils';

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return <LoaderCircle className={cn('h-4 w-4 animate-spin', className)} aria-hidden />;
}
