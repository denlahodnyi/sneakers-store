'use client';

import { Button, Typography } from '@mui/material';
import Link from 'next/link';
import { useTransition, type PropsWithChildren } from 'react';

export function PageHeaderContainer({ children }: PropsWithChildren) {
  return <div className="mb-5 flex items-center">{children}</div>;
}

export function PageHeaderActionsContainer({ children }: PropsWithChildren) {
  return <div className="flex items-center gap-3">{children}</div>;
}

export function PageTitle({ children }: PropsWithChildren) {
  return (
    <Typography component="h1" flexGrow={1} variant="h3">
      {children}
    </Typography>
  );
}

export function CreateRecordLink({ href }: { href: string }) {
  return (
    <Button component={Link} href={href} size="large" variant="outlined">
      Create new
    </Button>
  );
}

export function EditRecordLink({ href }: { href: string }) {
  return (
    <Button component={Link} href={href} size="large" variant="outlined">
      Edit
    </Button>
  );
}

export function DeleteRecordButton({ onDelete }: { onDelete: () => unknown }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      color="error"
      disabled={pending}
      size="large"
      type="submit"
      variant="outlined"
      onClick={() => {
        startTransition(() => {
          onDelete();
        });
      }}
    >
      Delete
    </Button>
  );
}
