'use client';
import { DeleteOutline, EditOutlined } from '@mui/icons-material';
import { IconButton, CircularProgress } from '@mui/material';
import { CldImage } from 'next-cloudinary';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { deleteImage } from '../_api/product-img.server-fn';
import EditProductImageModal from './EditProductImageModal';

interface EditableProductImageProps {
  imageId: string;
  publicId: string;
  url: string;
  alt: string;
}

export default function EditableProductImage({
  imageId,
  publicId,
  url,
  alt,
}: EditableProductImageProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative size-[100px] rounded-md">
      <CldImage
        fill
        alt={alt}
        className="rounded-[inherit] object-cover"
        src={url}
      />
      <span className="absolute right-0 top-0 z-10 -translate-y-1/4 translate-x-1/4">
        <IconButton
          className="mr-1 size-[26px] border border-solid border-slate-600 bg-white p-[2px]"
          onClick={() => setIsModalOpen(true)}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        <EditProductImageModal
          alt={alt}
          imageId={imageId}
          open={isModalOpen}
          publicId={publicId}
          url={url}
          onClose={() => setIsModalOpen(false)}
          onSuccessUpdate={() => router.refresh()}
        />

        <IconButton
          aria-label="delete image"
          className="size-[26px] border border-solid border-slate-600 bg-white p-[2px]"
          disabled={pending}
          onClick={() => {
            startTransition(async () => {
              const result = await deleteImage(imageId, publicId);
              if (result.success) {
                router.refresh();
              }
            });
          }}
        >
          {pending ? (
            <CircularProgress size={16} />
          ) : (
            <DeleteOutline color="error" fontSize="small" />
          )}
        </IconButton>
      </span>
    </div>
  );
}
