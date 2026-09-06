import { HttpResponseInit } from '@azure/functions';
import { AppError } from './errors';

export interface StandardErrorResponse {
  error: {
    code: string;
    message: string;
  };
}

export function okResponse(body: unknown, status: number = 200): HttpResponseInit {
  return {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
    jsonBody: body,
  };
}

export function createdResponse(body: unknown): HttpResponseInit {
  return okResponse(body, 201);
}

export function noContentResponse(): HttpResponseInit {
  return {
    status: 204,
  };
}

export function errorResponse(error: unknown): HttpResponseInit {
  if (error instanceof AppError) {
    const errorBody: StandardErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
      },
    };
    return {
      status: error.statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      jsonBody: errorBody,
    };
  }

  // Fallback for unknown errors (avoids leaking stack trace / internal details)
  const fallbackBody: StandardErrorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
    },
  };
  return {
    status: 500,
    headers: {
      'Content-Type': 'application/json',
    },
    jsonBody: fallbackBody,
  };
}
