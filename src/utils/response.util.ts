import type { ApiResponse } from '../types/response';

export class ResponseUtil {
  static success<T>(data: T, message?: string): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static error(message: string, status: number = 400): Response {
    const response: ApiResponse<null> = {
      success: false,
      error: message
    };
    
    return new Response(JSON.stringify(response), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  static notFound(message: string = 'Resource not found'): Response {
    return this.error(message, 404);
  }

  static unauthorized(message: string = 'Unauthorized'): Response {
    return this.error(message, 401);
  }
}