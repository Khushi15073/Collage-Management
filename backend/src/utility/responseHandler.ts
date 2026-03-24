import type { Response } from "express";
import { AppError } from "./errorClass";

export interface IResponse {
  code: number;
  message: string;
  data?: any;
}

class ResponseHandler {
  static async sendResponse(
    code: number,
    message: string,
    data: any = null,
  ): Promise<IResponse> {
    return {
      code,
      message,
      data,
    };
  }

  static async handleError(error: any) {
    if (error instanceof AppError) {
      return await this.sendResponse(
        error.statusCode,
        error.message,
        error.data
      )
    }

    return await this.sendResponse(
      500,
      error.message || 'Internal server error',
      null
    )
  }
  static handleResponse(res: Response, responseObj: any) {
    res.status(responseObj.code).json(responseObj);
  }
}

export default ResponseHandler