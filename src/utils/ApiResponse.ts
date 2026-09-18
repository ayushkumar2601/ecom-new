export class ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: any;

  constructor(success: boolean, data?: T, message?: string, meta?: any) {
    this.success = success;
    if (data) this.data = data;
    if (message) this.message = message;
    if (meta) this.meta = meta;
  }

  static success<T>(data: T, meta?: any) {
    return new ApiResponse(true, data, undefined, meta);
  }

  static error(message: string, errorCode: string = 'INTERNAL_ERROR', details: any[] = []) {
    return {
      success: false,
      message,
      errorCode,
      details,
    };
  }
}
