import {
  Catch,
  HttpException,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { /* Request, */ Response } from 'express';

import { ValidationException } from '../exceptions/validation.exception.js';

type ExceptionResponse =
  | string
  | {
      message?: string;
      details?: string;
    };

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    // const request = ctx.getResponse<Request>();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ExceptionResponse;
    const errors =
      exception instanceof ValidationException ? exception.errors : null;
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : exceptionResponse.message || null;
    const details =
      typeof exceptionResponse !== 'string'
        ? exceptionResponse.details || null
        : null;

    console.log('💀 exception message: ', message);
    console.log('💀 exception errors: ', errors);
    if (exception.cause) console.log('💀 exception cause: ', exception.cause);

    return response.status(statusCode).json({
      status: 'error',
      statusCode,
      // validation errors
      errors,
      // human readable message
      message,
      // optional details
      details,
    });
  }
}
