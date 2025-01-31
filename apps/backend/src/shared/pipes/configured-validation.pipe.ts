import { ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import type { FormattedErrors } from '@sneakers-store/contracts';

import { ValidationException } from '../exceptions/validation.exception.js';

export const formatErrors = (errors: ValidationError[]) => {
  return errors.reduce<FormattedErrors>((prev, current) => {
    if (current.children?.length) {
      prev[current.property] = formatErrors(current.children);
    } else {
      prev[current.property] = current.constraints
        ? Object.values(current.constraints)
        : [];
    }
    return prev;
  }, {});
};

// ValidationPipe wrapper that throws ValidationException with formatted errors
export class ConfiguredValidationPipe extends ValidationPipe {
  constructor(options: ValidationPipeOptions & { errorMessage?: string } = {}) {
    super({
      whitelist: true,
      enableDebugMessages: true,
      validationError: { target: true, value: true },
      // transform: true,
      // transformOptions: { enableImplicitConversion: true },
      exceptionFactory(errors) {
        const exception = new ValidationException(options.errorMessage);
        exception.errors = formatErrors(errors);
        return exception;
      },
      ...options,
    });
  }
}
