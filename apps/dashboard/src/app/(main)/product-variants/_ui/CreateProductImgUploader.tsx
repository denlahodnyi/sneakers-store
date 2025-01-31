'use client';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';

import { getClQueueResultsInfo, SharedClWidget } from '~/shared/ui/img-upload';
import { createImage } from '../_api/product-img.server-fn';

export default function CreateProductImgUploader({
  productVarId,
}: {
  productVarId: string;
}) {
  const router = useRouter();
  return (
    <>
      <SharedClWidget
        onQueuesEnd={async (result) => {
          const resultsInfo = getClQueueResultsInfo(result);
          if (resultsInfo) {
            const requests = resultsInfo.map((upd) =>
              createImage({
                productVarId,
                publicId: upd.public_id,
                url: upd.url,
                width: upd.width,
                height: upd.height,
                alt: '',
              }),
            );
            try {
              await Promise.allSettled(requests);
              router.refresh();
            } catch (error) {
              console.error(error);
            }
          }
        }}
      >
        {({ open }) => (
          <Button onClick={() => open()}>
            <Add />
            Add new
          </Button>
        )}
      </SharedClWidget>
    </>
  );
}
