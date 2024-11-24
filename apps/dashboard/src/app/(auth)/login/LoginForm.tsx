'use client';

import {
  Alert,
  Button,
  CircularProgress,
  Snackbar,
  TextField,
} from '@mui/material';
import { useActionState, useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { PasswordTextfield } from '~/shared/ui/inputs';

type InitState = { message: string } | undefined;

type SignInServerFn = (
  prev: InitState,
  formData: FormData,
) => Promise<{ message: string } | undefined>;

function LoginForm(props: { signInServerFn: SignInServerFn }) {
  const [state, formAction] = useActionState<InitState, FormData>(
    props.signInServerFn,
    {
      message: '',
    },
  );
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (state?.message) setShowError(!!state.message);
  }, [state?.message]);

  return (
    <form action={formAction} className="flex flex-col space-y-4">
      <TextField required label="Email" name="email" type="email" />
      <PasswordTextfield required label="Password" name="password" />
      <SubmitButton />
      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        autoHideDuration={4000}
        open={showError}
        onClose={() => setShowError(false)}
      >
        <Alert
          severity="error"
          variant="standard"
          onClose={() => setShowError(false)}
        >
          {state?.message}
        </Alert>
      </Snackbar>
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
