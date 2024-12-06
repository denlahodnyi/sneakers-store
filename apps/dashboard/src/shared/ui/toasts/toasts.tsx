import { Alert, Snackbar, type AlertProps } from '@mui/material';
import type { PropsWithChildren } from 'react';

export function Toast({
  children,
  open,
  onClose,
  severity,
  variant = 'standard',
}: PropsWithChildren & {
  open: boolean;
  onClose: () => void;
  severity: AlertProps['severity'];
  variant?: AlertProps['variant'];
}) {
  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      autoHideDuration={4000}
      open={open}
      onClose={onClose}
    >
      <Alert severity={severity} variant={variant} onClose={onClose}>
        {children}
      </Alert>
    </Snackbar>
  );
}
