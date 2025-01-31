'use client';
import { DeleteOutline, UploadFile } from '@mui/icons-material';
import { Button, CircularProgress, IconButton } from '@mui/material';
import {
  CldImage,
  type CloudinaryUploadWidgetError,
  type CloudinaryUploadWidgetResults,
} from 'next-cloudinary';
import { useState, useTransition } from 'react';

import { deleteClAssetByPublicId } from '~/shared/api/client-only';
import { getClQueueResultsInfo, SharedClWidget } from '~/shared/ui/img-upload';

type ImageInfo = Exclude<
  NonNullable<CloudinaryUploadWidgetResults['info']>,
  string
>;

export default function NewProductImgUploader({
  onChange,
}: {
  onChange: (images: ImageInfo[]) => void;
}) {
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [error, setError] = useState<CloudinaryUploadWidgetError | null>(null);
  const [deletePending, startDelTransition] = useTransition();

  return (
    <>
      {images.length > 0 && (
        <div className="mb-3 flex gap-3">
          {images.map((image) => (
            <div
              key={image.public_id}
              className="relative size-[100px] rounded-md"
            >
              <CldImage
                fill
                alt=""
                className="rounded-[inherit] object-cover"
                src={image.url}
              />
              <span>
                <IconButton
                  className="absolute right-0 top-0 size-[26px] -translate-y-1/4 translate-x-1/4 border border-solid border-slate-600 bg-white p-[2px]"
                  disabled={deletePending}
                  onClick={() => {
                    startDelTransition(async () => {
                      const result = await deleteClAssetByPublicId(
                        image.public_id,
                      );
                      if (result.success) {
                        setImages((prev) => {
                          const list = prev.filter(
                            (inf) => inf.public_id !== image.public_id,
                          );
                          onChange(list);
                          return list;
                        });
                      }
                    });
                  }}
                >
                  {deletePending ? (
                    <CircularProgress size={16} />
                  ) : (
                    <DeleteOutline fontSize="small" />
                  )}
                </IconButton>
              </span>
            </div>
          ))}
        </div>
      )}
      <SharedClWidget
        onQueuesStart={() => setError(null)}
        onQueuesEnd={(result) => {
          const resultsInfo = getClQueueResultsInfo(result);
          if (resultsInfo) {
            setImages(resultsInfo);
            onChange(resultsInfo);
          }
        }}
      >
        {({ open }) => (
          <Button onClick={() => open()}>
            <UploadFile />
            Add images
          </Button>
        )}
      </SharedClWidget>
      {error && (
        <p className="mt-1 text-error">
          {typeof error === 'string' ? error : error.statusText}
        </p>
      )}
    </>
  );
}
