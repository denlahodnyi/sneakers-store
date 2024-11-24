import { Card, Typography } from '@mui/material';
import { isRedirectError } from 'next/dist/client/components/redirect';

import { AuthError, signIn } from '~/shared/api';
import LoginForm from './LoginForm';

function LoginPage() {
  const signInServerFn = async (
    prevState: { message: string } | undefined,
    formData: FormData,
  ) => {
    'use server';
    try {
      formData.set('asAdmin', 'true');
      formData.set('redirectTo', '/');
      await signIn('credentials', formData); // throws redirect on success
    } catch (error) {
      if (isRedirectError(error)) {
        throw error;
      } else if (error instanceof AuthError) {
        return { message: error.cause?.err?.message || 'Some error occurred' };
      }
    }
  };

  return (
    <div className="grid min-h-screen place-content-center bg-gradient-to-tr from-main from-0% to-secondary to-100%">
      <Card elevation={3} sx={{ p: 6 }}>
        <Typography
          component="h1"
          fontWeight="bold"
          marginBottom="1rem"
          sx={{ textAlign: 'center' }}
          variant="h3"
        >
          Sign In
        </Typography>
        <LoginForm signInServerFn={signInServerFn} />
      </Card>
    </div>
  );
}

export default LoginPage;
