import { LogOut } from 'lucide-react';

import { Button } from '../../components/ui/button';

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut(): void;
}

export function DashboardHeader({ userEmail, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">Task Console</p>
          <p className="text-sm text-muted-foreground">
            Signed in as <span className="font-semibold text-foreground">{userEmail}</span>
          </p>
        </div>
        <Button variant="outline" onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </header>
  );
}
