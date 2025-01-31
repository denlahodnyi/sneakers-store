'use client';
import { UploadFile } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormGroup,
  TextField,
} from '@mui/material';
import { CldImage } from 'next-cloudinary';
import { Controller, useForm } from 'react-hook-form';
import { useState, useTransition } from 'react';

import { Toast } from '~/shared/ui/toasts';
import { SharedClWidget } from '~/shared/ui/img-upload';
import { updateImage } from '../_api/product-img.server-fn';

interface EditProductImageModalProps {
  open: boolean;
  onClose: () => void;
  onSuccessUpdate: () => void;
  imageId: string;
  publicId: string;
  url: string;
  alt: string;
}

export default function EditProductImageModal({
  open,
  imageId,
  publicId,
  url,
  alt,
  onClose,
  onSuccessUpdate,
}: EditProductImageModalProps) {
  const {
    control,
    formState: { isDirty },
    handleSubmit,
  } = useForm<{ alt: string }>({
    defaultValues: { alt },
  });
  const [pending, startTransition] = useTransition();
  const [successAlert, setSuccessAlert] = useState<[boolean, string]>([
    false,
    '',
  ]);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Edit image</DialogTitle>
      <DialogContent>
        <div className="relative mb-2 size-[300px]">
          <CldImage
            fill
            alt=""
            className="rounded-[inherit] object-cover"
            src={url}
          />
        </div>
        <SharedClWidget
          options={{
            multiple: false,
            publicId,
          }}
          onSuccess={async (results) => {
            const { info, event } = results;
            if (event === 'success' && info && typeof info !== 'string') {
              const { success } = await updateImage({
                imageId,
                url: info.url,
                width: info.width,
                height: info.height,
              });
              if (success) {
                setSuccessAlert([true, 'Image successfully updated']);
                onSuccessUpdate();
              }
            }
          }}
        >
          {({ open }) => (
            <Button onClick={() => open()}>
              <UploadFile />
              Change image
            </Button>
          )}
        </SharedClWidget>

        <form
          className="mt-4 space-y-3"
          onSubmit={handleSubmit((data) => {
            startTransition(async () => {
              const { success } = await updateImage({
                imageId,
                alt: data.alt,
              });
              if (success) {
                setSuccessAlert([true, 'Image data successfully updated']);
                onSuccessUpdate();
              }
            });
          })}
        >
          <FormGroup>
            <Controller
              control={control}
              name="alt"
              render={({ field }) => (
                <TextField {...field} multiline label="Alt text" minRows={5} />
              )}
            />
          </FormGroup>
          <Button
            disabled={!isDirty || pending}
            type="submit"
            variant="contained"
          >
            {pending && (
              <CircularProgress className="mr-1" color="inherit" size={14} />
            )}
            Save
          </Button>
        </form>

        <Toast
          open={successAlert[0]}
          severity="success"
          onClose={() => setSuccessAlert([false, ''])}
        >
          {successAlert[1]}
        </Toast>
      </DialogContent>
    </Dialog>
  );
}
