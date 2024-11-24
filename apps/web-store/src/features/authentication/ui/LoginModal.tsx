import type { PropsWithChildren } from 'react';

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '~/shared/ui';
import LoginForm from './LoginForm';

function LoginModal({ children }: PropsWithChildren) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent aria-describedby="" className="max-w-md">
        <DialogTitle className="text-center text-4xl">Sign In</DialogTitle>
        <div className="flex flex-col items-center">
          <LoginForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
