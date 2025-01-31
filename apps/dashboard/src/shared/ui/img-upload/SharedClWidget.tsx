'use client';
import { CldUploadWidget, type CldUploadWidgetProps } from 'next-cloudinary';

import { env } from '~/shared/config';

const { NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET } = env;

type SharedClWidgetProps = CldUploadWidgetProps;

export default function SharedClWidget(props: SharedClWidgetProps) {
  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      uploadPreset={NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      options={{
        sources: ['local'],
        ...props.options,
      }}
      onError={(error) => console.error(error)}
      {...props}
    >
      {props.children}
    </CldUploadWidget>
  );
}
