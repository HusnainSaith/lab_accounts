import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

interface PostgresError {
  code?: string;
  constraint?: string;
  detail?: string;
}

@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const error = exception.driverError as PostgresError;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle PostgreSQL constraint violations
    if (error?.code === '23505') { // Unique constraint violation
      status = HttpStatus.CONFLICT;
      
      if (error.constraint === 'users_email_key') {
        message = 'Email already exists';
      } else if (error.constraint === 'uk_companies_trn') {
        message = 'TRN number already exists for another company';
      } else if (error.constraint === 'uk_companies_name_en') {
        message = 'Company name already exists';
      } else if (error.detail) {
        // Extract field name from detail message
        const match = error.detail.match(/Key \((.+)\)=\(.+\) already exists/);
        const field = match ? match[1] : 'field';
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
      } else {
        message = 'Duplicate entry detected';
      }
    } else if (error?.code === '23503') { // Foreign key constraint violation
      status = HttpStatus.BAD_REQUEST;
      message = 'Referenced record does not exist';
    } else if (error?.code === '23502') { // Not null constraint violation
      status = HttpStatus.BAD_REQUEST;
      message = 'Required field is missing';
    } else if (error?.code === '23514') { // Check constraint violation
      status = HttpStatus.BAD_REQUEST;
      message = 'Invalid data provided';
    }

    response.status(status).json({
      statusCode: status,
      error: this.getErrorName(status),
      message,
      timestamp: new Date().toISOString(),
    });
  }

  private getErrorName(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return 'Bad Request';
      case HttpStatus.CONFLICT:
        return 'Conflict';
      default:
        return 'Internal Server Error';
    }
  }
}