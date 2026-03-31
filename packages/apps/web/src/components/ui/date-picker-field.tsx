import { CalendarDays, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { Button } from './button';
import { formatDateOnly, parseDateOnly } from '../../shared/lib/date';
import { cn } from '../../shared/lib/utils';

interface DatePickerFieldProps {
  value: string | null;
  onChange(value: string | null): void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

const formatDisplayDate = (value: string): string =>
  new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(parseDateOnly(value));

export function DatePickerField({
  value,
  onChange,
  placeholder = 'Select date',
  disabled = false,
  allowClear = false,
  className,
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDate = value ? parseDateOnly(value) : undefined;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onWindowMouseDown = (event: MouseEvent): void => {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    };

    window.addEventListener('mousedown', onWindowMouseDown);
    return () => window.removeEventListener('mousedown', onWindowMouseDown);
  }, [isOpen]);

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
          disabled={disabled}
          onClick={() => setIsOpen((current) => !current)}
        >
          <CalendarDays className="mr-2 h-4 w-4" />
          {value ? formatDisplayDate(value) : placeholder}
        </Button>
        {allowClear && value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label="Clear date"
          >
            <X className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
      {isOpen ? (
        <div className="absolute z-30 mt-2 rounded-md border border-border bg-card p-3 shadow-lg">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) {
                return;
              }

              onChange(formatDateOnly(date));
              setIsOpen(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
