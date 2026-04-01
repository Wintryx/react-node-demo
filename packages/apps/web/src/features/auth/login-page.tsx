import { useMutation } from '@tanstack/react-query';
import { SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from './auth-context';
import { getAuthCopy } from './auth-copy';
import { AuthPageShell } from './auth-page-shell';
import { Alert, Button, CardContent, Input, Label, Spinner } from '../../components/ui';
import { useI18n } from '../i18n';

interface LoginFormValues {
  email: string;
  password: string;
}

interface RedirectLocationState {
  from?: string;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { language } = useI18n();
  const copy = getAuthCopy(language);

  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      const state = location.state as RedirectLocationState | null;
      navigate(state?.from ?? '/app', { replace: true });
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const onSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setFormError(null);
    loginMutation.mutate(formValues);
  };

  return (
    <AuthPageShell
      title={copy.login.title}
      description={copy.login.description}
      footerLabel={copy.login.footerLabel}
      footerLinkLabel={copy.login.footerLinkLabel}
      footerLinkTo="/register"
      badgeText={copy.shell.badge}
    >
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="login-email">{copy.login.email}</Label>
            <Input
              id="login-email"
              type="email"
              required
              value={formValues.email}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  email: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">{copy.login.password}</Label>
            <Input
              id="login-password"
              type="password"
              required
              value={formValues.password}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
            />
          </div>
          {formError ? <Alert variant="danger">{formError}</Alert> : null}
          <Button className="w-full" type="submit" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                {copy.login.submitting}
              </span>
            ) : (
              copy.login.submit
            )}
          </Button>
        </form>
      </CardContent>
    </AuthPageShell>
  );
}
