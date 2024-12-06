'use client';

import { Button, CircularProgress, TextField } from '@mui/material';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { PasswordTextfield } from '~/shared/ui/inputs';
import { Toast } from '~/shared/ui/toasts';

type InitState = { message: string } | undefined;

type SignInServerFn = (
  prev: InitState,
  formData: FormData,
) => Promise<{ message: string } | undefined>;

function LoginForm(props: { signInServerFn: SignInServerFn }) {
  const [state, formAction] = useActionState(props.signInServerFn, undefined);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (state?.message) setShowError(!!state.message);
  }, [state?.message]);

  return (
    <form action={formAction} className="flex flex-col space-y-4">
      <TextField required label="Email" name="email" type="email" />
      <PasswordTextfield required label="Password" name="password" />
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
