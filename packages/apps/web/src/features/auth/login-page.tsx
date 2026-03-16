import { useMutation } from '@tanstack/react-query';
import { SyntheticEvent, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from './auth-context';
import { AuthPageShell } from './auth-page-shell';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Spinner } from '../../components/ui/spinner';

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
      title="Welcome back"
      description="Melde dich an, um auf das Task Board zuzugreifen."
      footerLabel="Noch kein Account?"
      footerLinkLabel="Register"
      footerLinkTo="/register"
    >
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="login-email">E-Mail</Label>
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
            <Label htmlFor="login-password">Passwort</Label>
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
                Signing in...
              </span>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>
    </AuthPageShell>
  );
}
