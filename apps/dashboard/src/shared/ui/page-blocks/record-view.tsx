import { Typography, type TypographyProps } from '@mui/material';
import type { PropsWithChildren } from 'react';

export function Attribute({ children }: PropsWithChildren) {
  return <div className="mb-5 space-y-1">{children}</div>;
}

export function AttributeName({ children }: PropsWithChildren) {
  return (
    <Typography component="p" variant="h6">
      {children}
    </Typography>
  );
}

export function AttributeValue({
  children,
  ...rest
}: PropsWithChildren & TypographyProps) {
  return (
    <Typography component="p" {...rest}>
      {children}
    </Typography>
  );
}
