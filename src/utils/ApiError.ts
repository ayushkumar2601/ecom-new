export class ApiError extends Error {
  statusCode: number;
  errorCode: string;
  isOperational: boolean;

  constructor(statusCode: number, message: string, errorCode: string = 'INTERNAL_ERROR', isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
