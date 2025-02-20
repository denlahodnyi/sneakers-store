'use client';
import { useState } from 'react';

import CheckoutCustomerForm from '~/app/(shop)/checkout/_ui/CheckoutCustomerForm';
import { LoginModal, useAuth } from '~/features/authentication';
import { Button } from '~/shared/ui';

export default function CheckoutCustomer() {
  const auth = useAuth();
  const [showGuestForm, setShowGuestForm] = useState(false);

  return (
    <div>
      {!auth?.user?.id && (
        <div>
          <LoginModal>
            <Button className="px-0" variant="link">
              Sign in
            </Button>
          </LoginModal>{' '}
          {!showGuestForm && (
            <>
              or{' '}
              <Button
                className="px-0"
                variant="link"
                onClick={() => setShowGuestForm(true)}
              >
                Continue as a guest
              </Button>
            </>
          )}
        </div>
      )}
      {(auth?.user?.id || showGuestForm) && <CheckoutCustomerForm />}
    </div>
  );
}
