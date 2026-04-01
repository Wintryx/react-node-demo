import { useMutation } from '@tanstack/react-query';
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from './auth-context';
import { getAuthCopy } from './auth-copy';
import { AuthPageShell } from './auth-page-shell';
import { getPasswordPolicyHint, passwordPolicyRegex } from './password-rules';
import { Alert, Button, CardContent, Input, Label, Spinner } from '../../components/ui';
import { useI18n } from '../i18n';

interface RegisterFormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { language } = useI18n();
  const copy = getAuthCopy(language);
  const passwordPolicyHint = getPasswordPolicyHint(language);

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
      setFormError(copy.register.passwordMismatch);
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
      title={copy.register.title}
      description={copy.register.description}
      footerLabel={copy.register.footerLabel}
      footerLinkLabel={copy.register.footerLinkLabel}
      footerLinkTo="/login"
      badgeText={copy.shell.badge}
    >
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="register-email">{copy.register.email}</Label>
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
            <Label htmlFor="register-password">{copy.register.password}</Label>
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
            <Label htmlFor="register-password-confirm">{copy.register.confirmPassword}</Label>
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
                {copy.register.submitting}
              </span>
            ) : (
              copy.register.submit
            )}
          </Button>
        </form>
      </CardContent>
    </AuthPageShell>
  );
}
