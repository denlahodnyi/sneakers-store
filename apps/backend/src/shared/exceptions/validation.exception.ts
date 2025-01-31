import { HttpException, HttpStatus } from '@nestjs/common';
import type { FormattedErrors } from '@sneakers-store/contracts';

// Custom validation exception that holds errors (aka form errors)
export class ValidationException extends HttpException {
  errors: FormattedErrors | null = null;
  constructor(...args: Partial<ConstructorParameters<typeof HttpException>>) {
    super(args[0] || 'Bad request', args[1] || HttpStatus.BAD_REQUEST, args[2]);
  }
}
