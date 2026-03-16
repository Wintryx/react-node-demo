import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { ReactNode, createContext, useContext, useEffect, useRef, useState } from 'react';

import { Button } from '../../components/ui/button';
import { cn } from '../../shared/lib/utils';

type ToastVariant = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ShowToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  showToast(input: ShowToastInput): string;
  success(title: string, description?: string): string;
  error(title: string, description?: string): string;
  info(title: string, description?: string): string;
  dismissToast(id: string): void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

const DEFAULT_DURATION_MS = 4000;
const MAX_TOASTS = 4;

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-emerald-300 bg-emerald-50/95 text-emerald-900',
  error: 'border-red-300 bg-red-50/95 text-red-900',
  info: 'border-sky-300 bg-sky-50/95 text-sky-900',
};

const variantIcon = (variant: ToastVariant): ReactNode => {
  if (variant === 'success') {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (variant === 'error') {
    return <AlertTriangle className="h-4 w-4" />;
  }

  return <Info className="h-4 w-4" />;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());
  const idCounterRef = useRef(0);

  const dismissToast = (id: string): void => {
    const timeoutId = timersRef.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timersRef.current.delete(id);
    }

    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const showToast = ({
    title,
    description,
    variant = 'info',
    durationMs = DEFAULT_DURATION_MS,
  }: ShowToastInput): string => {
    idCounterRef.current += 1;
    const id = `toast-${idCounterRef.current}`;

    const toast: Toast = {
      id,
      title,
      description,
      variant,
    };

    setToasts((current) => [toast, ...current].slice(0, MAX_TOASTS));

    const timeoutId = window.setTimeout(() => {
      dismissToast(id);
    }, durationMs);
    timersRef.current.set(id, timeoutId);

    return id;
  };

  const value: ToastContextValue = {
    showToast,
    success: (title: string, description?: string) =>
      showToast({ title, description, variant: 'success' }),
    error: (title: string, description?: string) =>
      showToast({ title, description, variant: 'error' }),
    info: (title: string, description?: string) => showToast({ title, description, variant: 'info' }),
    dismissToast,
  };

  useEffect(
    () => () => {
      timersRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timersRef.current.clear();
    },
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 w-[min(92vw,26rem)] space-y-2" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role={toast.variant === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto animate-fade-in rounded-lg border px-3 py-3 shadow-lg backdrop-blur',
              variantStyles[toast.variant],
            )}
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5">{variantIcon(toast.variant)}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-xs leading-relaxed text-current/90">{toast.description}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-black/10"
                onClick={() => dismissToast(toast.id)}
                aria-label="Hinweis schliessen"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = (): ToastContextValue => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return value;
};
