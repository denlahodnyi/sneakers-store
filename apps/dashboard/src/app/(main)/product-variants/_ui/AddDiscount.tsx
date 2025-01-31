'use client';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import DiscountForm from './DiscountForm';

export default function AddDiscount({
  productVariantId,
}: {
  productVariantId: string;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  if (showForm) {
    return (
      <DiscountForm
        actionType="create"
        defaultValues={{ productVarId: productVariantId }}
        onCancel={() => setShowForm(false)}
        onSuccess={() => {
          setShowForm(false);
          router.refresh();
        }}
      />
    );
  }
  return (
    <div>
      <Button variant="contained" onClick={() => setShowForm(true)}>
        <Add color="inherit" />
        Add new
      </Button>
    </div>
  );
}
