import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui';

interface AuthPageShellProps {
  title: string;
  description: string;
  footerLabel: string;
  footerLinkLabel: string;
  footerLinkTo: string;
  children: ReactNode;
}

export function AuthPageShell({
  title,
  description,
  footerLabel,
  footerLinkLabel,
  footerLinkTo,
  children,
}: AuthPageShellProps) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="overflow-hidden border-white/50 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-2">
            <div className="inline-flex w-fit items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              React + NestJS Demo
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {children}
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {footerLabel}{' '}
          <Link className="font-semibold text-primary underline-offset-4 hover:underline" to={footerLinkTo}>
            {footerLinkLabel}
          </Link>
        </p>
      </div>
    </div>
  );
}
