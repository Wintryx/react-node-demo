import { LogOut } from 'lucide-react';

import { Button } from '../../../components/ui';
import { LanguageToggle } from '../../i18n';
import { dashboardTranslations } from '../dashboard-translations';

interface DashboardHeaderProps {
  userEmail: string | null;
  onSignOut(): void;
}

export function DashboardHeader({ userEmail, onSignOut }: DashboardHeaderProps) {
  return (
    <header className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-2xl font-bold">{dashboardTranslations.header.title}</p>
          <p className="text-sm text-muted-foreground">
            {dashboardTranslations.header.signedInAs}{' '}
            <span className="font-semibold text-foreground">{userEmail}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Button variant="outline" onClick={onSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            {dashboardTranslations.header.signOut}
          </Button>
        </div>
      </div>
    </header>
  );
}
