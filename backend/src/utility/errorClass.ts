import { ResponseCodes } from "../enums/responseCodes";
import { ErrorMessages } from "../enums/ErrorMessages";

export class AppError extends Error {
  readonly statusCode: number;
  readonly status: string;
  readonly data?: any;

  constructor(message: string, statusCode: number = 500, data: any = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.data = data;
  }


  static badRequest(message: string, data: any = null) {
    return new AppError(message, ResponseCodes.BAD_REQUEST, data);
  }

  static unauthorized(message: string, data: any = null) {
    return new AppError(message, ResponseCodes.UNAUTHORIZED, data)
  }

  static forbidden(message: string, data: any = null) {
    return new AppError(message, ResponseCodes.FORBIDDEN, data)
  }
  static notFound(message: string, data: any = null) {
    return new AppError(message, ResponseCodes.NOT_FOUND, data)
  }
  static conflict(message: string, data: any = null) {
    return new AppError(message, ResponseCodes.CONFLICT, data)
  }
  static internal(message: string = ErrorMessages.InternalServerError, data: any = null) {
    return new AppError(message, ResponseCodes.INTERNAL_SERVER_ERROR, data)
  }
}
