import { useMutation } from '@tanstack/react-query';
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './auth-context';
import { AuthPageShell } from './auth-page-shell';
import { passwordPolicyHint, passwordPolicyRegex } from './password-rules';
import { Alert } from '../../components/ui/alert';
import { Button } from '../../components/ui/button';
import { CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Spinner } from '../../components/ui/spinner';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formValues, setFormValues] = useState<RegisterFormValues>({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      navigate('/app', { replace: true });
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const validateForm = (): boolean => {
    if (formValues.password !== formValues.confirmPassword) {
      setFormError('Passwords do not match.');
      return false;
    }

    if (!passwordPolicyRegex.test(formValues.password)) {
      setFormError(passwordPolicyHint);
      return false;
    }

    return true;
  };

  const onSubmit = (event: SyntheticEvent<HTMLFormElement, SubmitEvent>) => {
    event.preventDefault();
    setFormError(null);

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      email: formValues.email,
      password: formValues.password,
    });
  };

  return (
    <AuthPageShell
      title="Create account"
      description="Register to manage your task board."
      footerLabel="Already registered?"
      footerLinkLabel="Sign in"
      footerLinkTo="/login"
    >
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
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
            <Label htmlFor="register-password">Password</Label>
            <Input
              id="register-password"
              type="password"
              minLength={10}
              required
              value={formValues.password}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  password: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">{passwordPolicyHint}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="register-password-confirm">Confirm password</Label>
            <Input
              id="register-password-confirm"
              type="password"
              minLength={10}
              required
              value={formValues.confirmPassword}
              onChange={(event) =>
                setFormValues((previous) => ({
                  ...previous,
                  confirmPassword: event.target.value,
                }))
              }
            />
          </div>
          {formError ? <Alert variant="danger">{formError}</Alert> : null}
          <Button className="w-full" type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Spinner />
                Creating account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      </CardContent>
    </AuthPageShell>
  );
}
