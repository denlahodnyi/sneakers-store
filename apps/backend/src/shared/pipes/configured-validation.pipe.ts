import { ValidationPipe, type ValidationPipeOptions } from '@nestjs/common';
import type { ValidationError } from 'class-validator';

import {
  ValidationException,
  type FormattedErrors,
} from '../exceptions/validation.exception.js';

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
  constructor(options: ValidationPipeOptions = {}) {
    super({
      whitelist: true,
      exceptionFactory(errors) {
        const exception = new ValidationException();
        exception.errors = formatErrors(errors);
        return exception;
      },
      ...options,
    });
  }
}
