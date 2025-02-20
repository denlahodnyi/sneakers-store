'use client';

import { Button, CircularProgress, TextField } from '@mui/material';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { PasswordTextfield } from '~/shared/ui/form';
import { Toast } from '~/shared/ui/toasts';

type InitState = { message: string } | undefined;

type SignInServerFn = (
  prev: InitState,
  formData: FormData,
) => Promise<
  { message: string; errors?: Record<string, string[]> } | undefined
>;

function LoginForm(props: { signInServerFn: SignInServerFn }) {
  const [state, formAction] = useActionState(props.signInServerFn, undefined);
  const [showError, setShowError] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  useEffect(() => {
    if (state?.errors)
      setErrors({
        email: state.errors?.email[0] || '',
        password: state.errors?.password[0] || '',
      });
    else if (state?.message) setShowError(!!state.message);
  }, [state]);

  return (
    <form action={formAction} className="flex flex-col space-y-4">
      <TextField
        required
        error={!!errors.email}
        helperText={errors.email}
        label="Email"
        name="email"
        type="email"
      />
      <PasswordTextfield
        required
        error={!!errors.password}
        helperText={errors.password}
        label="Password"
        name="password"
      />
      <SubmitButton />
      <Toast
        open={showError}
        severity="error"
        onClose={() => setShowError(false)}
      >
        {state?.message}
      </Toast>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      disabled={pending}
      endIcon={pending && <CircularProgress color="inherit" size={18} />}
      type="submit"
      variant="contained"
    >
      Login
    </Button>
  );
}

export default LoginForm;
