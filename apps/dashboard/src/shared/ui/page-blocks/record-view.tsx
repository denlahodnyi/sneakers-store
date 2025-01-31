import { Typography, type TypographyProps } from '@mui/material';
import type { PropsWithChildren } from 'react';

import { getConicGradientFromHexes } from '../styles';

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

export function ColorDot({ hex = ['#000000'] }: { hex?: string[] }) {
  return (
    <span
      className="border-1 mr-2 inline-block min-h-[20px] min-w-[20px] rounded-full border border-solid border-slate-400 align-text-bottom"
      style={{ backgroundImage: getConicGradientFromHexes(hex) }}
    />
  );
}
