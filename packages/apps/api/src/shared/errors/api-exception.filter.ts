import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { ApiErrorCode } from './api-error-code';
import { createApiErrorPayload, isApiErrorPayload } from './api-error.helpers';
import { ApiErrorResponseBody } from './api-error.types';

interface ValidationExceptionResponse {
  message?: unknown;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    const { statusCode, errorPayload } = this.resolveException(exception);
    const body: ApiErrorResponseBody = {
      statusCode,
      code: errorPayload.code,
      message: errorPayload.message,
      ...(errorPayload.params ? { params: errorPayload.params } : {}),
      ...(errorPayload.validationIssues
        ? { validationIssues: errorPayload.validationIssues }
        : {}),
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.status(statusCode).json(body);
  }

  private resolveException(exception: unknown): {
    statusCode: number;
    errorPayload: ReturnType<typeof createApiErrorPayload>;
  } {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const response = exception.getResponse();

      if (isApiErrorPayload(response)) {
        return { statusCode, errorPayload: response };
      }

      if (this.isValidationErrorResponse(exception, response)) {
        const validationMessages = (response as ValidationExceptionResponse).message as string[];
        return {
          statusCode,
          errorPayload: createApiErrorPayload(ApiErrorCode.VALIDATION_ERROR, 'Validation failed.', {
            errors: validationMessages,
          }),
        };
      }

      return {
        statusCode,
        errorPayload: createApiErrorPayload(
          this.mapStatusToGenericCode(statusCode),
          this.extractHttpExceptionMessage(response, statusCode),
        ),
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorPayload: createApiErrorPayload(
        ApiErrorCode.INTERNAL_SERVER_ERROR,
        'Internal server error.',
      ),
    };
  }

  private isValidationErrorResponse(
    exception: HttpException,
    response: unknown,
  ): response is ValidationExceptionResponse {
    if (!(exception instanceof BadRequestException) || !response || typeof response !== 'object') {
      return false;
    }

    const message = (response as ValidationExceptionResponse).message;
    return Array.isArray(message) && message.every((entry) => typeof entry === 'string');
  }

  private extractHttpExceptionMessage(response: unknown, statusCode: number): string {
    if (typeof response === 'string' && response.trim().length > 0) {
      return response;
    }

    if (response && typeof response === 'object') {
      const message = (response as ValidationExceptionResponse).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    return HttpStatus[statusCode] ?? 'Request failed.';
  }

  private mapStatusToGenericCode(statusCode: number): ApiErrorCode {
    switch (statusCode) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.BAD_REQUEST;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.CONFLICT;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ApiErrorCode.TOO_MANY_REQUESTS;
      default:
        return ApiErrorCode.INTERNAL_SERVER_ERROR;
    }
  }
}
