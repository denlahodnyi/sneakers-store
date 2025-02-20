'use client';
import IntlTelInput, {
  type IntlTelInputRef,
} from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import { memo, useRef, type ComponentProps } from 'react';

import { cn } from '~/shared/lib';

export type PhoneInputProps = ComponentProps<typeof IntlTelInput>;

// https://github.com/jackocnr/intl-tel-input/blob/master/src/js/utils.js#L214
const errorMap = [
  'Invalid number',
  'Invalid country code',
  'Too short',
  'Too long',
  'Invalid number',
];

export const PhoneInput = memo(
  ({
    ref,
    initOptions,
    inputProps,
    className,
    onChangeErrorCode,
    onChangeValidity,
    ...rest
  }: Omit<PhoneInputProps, 'onChangeValidity'> & {
    className?: string;
    onChangeErrorCode?: (
      code: number | null,
      message: string | undefined,
    ) => void;
    onChangeValidity?: (valid: boolean, errorMessage: string | null) => void;
  }) => {
    const inputRef = useRef<null | IntlTelInputRef>(null);

    return (
      <IntlTelInput
        ref={(inst) => {
          inputRef.current = inst; // connect inner ref
          if (ref && typeof ref === 'function') {
            ref(inst); // connect outer ref
          }
        }}
        initOptions={{
          strictMode: true,
          separateDialCode: true,
          initialCountry: 'ua',
          countryOrder: ['us', 'ua'],
          ...initOptions,
        }}
        inputProps={{
          ...inputProps,
          className: cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          ),
        }}
        onChangeErrorCode={(code) => {
          if (onChangeErrorCode) onChangeErrorCode(code, errorMap[code || -1]);
        }}
        onChangeValidity={(isValid) => {
          if (onChangeValidity) {
            const instance = inputRef.current?.getInstance();
            const errorCode = instance?.getValidationError();
            const message = isValid
              ? null
              : errorCode && errorCode >= 0
                ? errorMap[errorCode]
                : 'Invalid number';
            onChangeValidity(isValid, message);
          }
        }}
        {...rest}
      />
    );
  },
);

PhoneInput.displayName = 'PhoneInput';
