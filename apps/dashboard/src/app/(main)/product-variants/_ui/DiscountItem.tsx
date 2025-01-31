'use client';
import {
  CancelOutlined,
  CheckCircleOutline,
  DeleteOutline,
  Edit,
} from '@mui/icons-material';
import {
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Typography,
} from '@mui/material';
import type { DiscountResponseDto } from '@sneakers-store/contracts';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import DiscountForm from './DiscountForm';
import { deleteDiscount } from '../_api/discounts.server-fn';

export default function DiscountItem({
  discount,
}: {
  discount: DiscountResponseDto;
}) {
  const router = useRouter();
  const [deletePending, startTransition] = useTransition();
  const [isEdit, setIsEdit] = useState(false);

  if (isEdit) {
    return (
      <DiscountForm
        actionType="edit"
        defaultValues={discount}
        id={discount.id}
        onCancel={() => setIsEdit(false)}
        onSuccess={() => {
          setIsEdit(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <Card className="max-w-[500px]" variant="outlined">
      <CardContent className="pt-3">
        <div className="flex items-center gap-1">
          <Typography className="flex-grow" component="h3" variant="h6">
            {discount.formattedDiscount}
          </Typography>
          <div>
            <IconButton
              aria-label="edit"
              className="size-[36px]"
              onClick={() => setIsEdit(true)}
            >
              <Edit />
            </IconButton>
            <IconButton
              aria-label="delete"
              className="size-[36px]"
              disabled={deletePending}
              onClick={() => {
                startTransition(() => {
                  deleteDiscount(discount.id);
                });
              }}
            >
              {deletePending ? (
                <CircularProgress color="inherit" size="16px" />
              ) : (
                <DeleteOutline color="error" />
              )}
            </IconButton>
          </div>
        </div>
        <Typography color="textSecondary" component="p" variant="subtitle2">
          ID:
          {discount.id}
        </Typography>
        <p>
          Active:
          {discount.isActive ? (
            <CheckCircleOutline
              color="success"
              sx={{ fontSize: 20, ml: 2, verticalAlign: 'text-bottom' }}
            />
          ) : (
            <CancelOutlined
              color="error"
              sx={{ fontSize: 20, ml: 2, verticalAlign: 'text-bottom' }}
            />
          )}
        </p>
      </CardContent>
    </Card>
  );
}
