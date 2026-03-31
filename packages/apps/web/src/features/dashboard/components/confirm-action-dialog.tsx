import { Button } from '../../../components/ui';
import { dashboardCopy } from '../dashboard-copy';

interface ConfirmActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  isConfirming?: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export function ConfirmActionDialog({
  open,
  title,
  description,
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmActionDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isConfirming}>
            {dashboardCopy.common.cancel}
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} disabled={isConfirming}>
            {dashboardCopy.common.confirmAction}
          </Button>
        </div>
      </div>
    </div>
  );
}
