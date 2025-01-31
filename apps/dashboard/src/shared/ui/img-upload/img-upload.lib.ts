import type {
  CloudinaryUploadWidgetInfo,
  CloudinaryUploadWidgetResults,
} from 'next-cloudinary';

export const getClQueueResultsInfo = (
  result: CloudinaryUploadWidgetResults,
) => {
  if (result.info && typeof result.info !== 'string' && result.info.files) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result.info.files as unknown as any[])
      .filter((o) => o.done && !o.failed)
      .map((o) => o.uploadInfo as CloudinaryUploadWidgetInfo);
  } else {
    console.log(result);
  }
};
