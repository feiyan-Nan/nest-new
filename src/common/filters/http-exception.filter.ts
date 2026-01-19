import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';
import { WinstonLoggerService } from '@/logger/winston-logger.service';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string;
  error?: string;
  details?: unknown;
  requestId?: string;
  stack?: string;
}

interface HttpExceptionResponse {
  message?: string;
  error?: string;
  details?: unknown;
}

interface ValidationError {
  property: string;
  constraints: Record<string, string>;
  value: unknown;
}

interface DatabaseDriverError {
  code?: string;
  message?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: WinstonLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logError(exception, errorResponse);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const timestamp = new Date().toISOString();
    const path = request.url;
    const method = request.method;
    const requestId = this.logger.getRequestId();
    const isDevelopment = process.env.NODE_ENV === 'development';

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined;
    let details: unknown;
    let stack: string | undefined;

    // HTTP Exception
    if (exception instanceof HttpException) {
      console.log(`➤➤➤ ~ http-exception.filter.ts ~ L75`);
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as HttpExceptionResponse;
        message = responseObj.message || message;
        error = responseObj.error;
        details = responseObj.details;
      }

      if (isDevelopment) {
        stack = exception.stack;
      }
    }
    // Validation Exception (class-validator)
    else if (this.isValidationError(exception)) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = 'Validation failed';
      error = 'Bad Request';
      details = this.extractValidationErrors(exception);
    }
    // Database Exception (TypeORM)
    else if (exception instanceof QueryFailedError) {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Database operation failed';
      error = 'Database Error';

      if (isDevelopment) {
        const dbError = exception.driverError as
          | DatabaseDriverError
          | undefined;
        details = {
          query: exception.query,
          parameters: exception.parameters as unknown[],
          driverError: dbError?.message,
        };
        stack = exception.stack;
      }

      // Handle specific database errors
      const driverError = exception.driverError as
        | DatabaseDriverError
        | undefined;
      if (driverError?.code === 'ER_DUP_ENTRY') {
        statusCode = HttpStatus.CONFLICT;
        message = 'Duplicate entry detected';
        error = 'Conflict';
      } else if (driverError?.code === 'ER_NO_REFERENCED_ROW_2') {
        statusCode = HttpStatus.BAD_REQUEST;
        message = 'Referenced record does not exist';
        error = 'Bad Request';
      }
    }
    // Unknown Exception
    else if (exception instanceof Error) {
      message = isDevelopment ? exception.message : 'Internal server error';
      error = 'Internal Server Error';

      if (isDevelopment) {
        stack = exception.stack;
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode,
      timestamp,
      path,
      method,
      message,
      error,
      requestId,
    };

    if (details) {
      errorResponse.details = details;
    }

    if (stack && isDevelopment) {
      errorResponse.stack = stack;
    }

    return errorResponse;
  }

  private logError(exception: unknown, errorResponse: ErrorResponse) {
    const { statusCode, path, method, message, requestId } = errorResponse;

    const logMeta = {
      statusCode,
      path,
      method,
      requestId,
      exceptionType: exception?.constructor?.name || 'Unknown',
    };

    // Only log 5xx errors as errors, 4xx as warnings
    if (statusCode >= 500) {
      this.logger.error(
        `[${method}] ${path} - ${message}`,
        'HttpExceptionFilter',
        {
          ...logMeta,
          exception: this.sanitizeException(exception),
        },
      );
    } else {
      this.logger.warn(
        `[${method}] ${path} - ${message}`,
        'HttpExceptionFilter',
        logMeta,
      );
    }
  }

  private isValidationError(exception: unknown): exception is ValidationError {
    return !!(
      exception &&
      typeof exception === 'object' &&
      'constraints' in exception &&
      'property' in exception
    );
  }

  private extractValidationErrors(
    exception: ValidationError | ValidationError[],
  ): unknown {
    if (Array.isArray(exception)) {
      return exception.map((error) => ({
        property: error.property,
        constraints: error.constraints,
        value: error.value,
      }));
    }

    return {
      property: exception.property,
      constraints: exception.constraints,
      value: exception.value,
    };
  }

  private sanitizeException(exception: unknown): unknown {
    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        stack:
          process.env.NODE_ENV === 'development' ? exception.stack : undefined,
      };
    }

    return exception;
  }
}
