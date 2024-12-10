import { Container } from '@mui/material';
import type { PropsWithChildren } from 'react';

export function PageContentContainer({ children }: PropsWithChildren) {
  return (
    <Container maxWidth={false} sx={{ px: { md: 6 }, pt: 4, pb: 6 }}>
      {children}
    </Container>
  );
}
