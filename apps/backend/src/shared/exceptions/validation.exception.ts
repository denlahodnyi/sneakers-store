import { HttpException, HttpStatus } from '@nestjs/common';

export interface FormattedErrors {
  [k: string]: string[] | FormattedErrors;
}

// Custom validation exception that holds errors (aka form errors)
export class ValidationException extends HttpException {
  errors: FormattedErrors | null = null;
  constructor(...args: Partial<ConstructorParameters<typeof HttpException>>) {
    super(args[0] || 'Bad request', args[1] || HttpStatus.BAD_REQUEST, args[2]);
  }
}
