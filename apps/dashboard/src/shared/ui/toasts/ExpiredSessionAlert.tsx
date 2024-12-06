'use client';
import { useEffect, useState } from 'react';

import { EXP_SESSION_COOKIE_OPTS } from '../constants';
import { Toast } from './toasts';

function LoginAgainAlert() {
  const [showAlert, setShowAlert] = useState(false);

  useEffect(() => {
    const showAlertCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${EXP_SESSION_COOKIE_OPTS.name}=`))
      ?.split('=')[1];

    if (showAlertCookie === EXP_SESSION_COOKIE_OPTS.value) {
      document.cookie = `${EXP_SESSION_COOKIE_OPTS.name}=; max-age=0;`;
      setShowAlert(true);
    }
  }, []);

  return (
    <Toast open={showAlert} severity="info" onClose={() => setShowAlert(false)}>
      Your session has expired. Please login again
    </Toast>
  );
}

export default LoginAgainAlert;
