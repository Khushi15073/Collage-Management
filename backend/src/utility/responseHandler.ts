import type { Response } from "express";
import { AppError } from "./errorClass";
import { ErrorMessages } from "../enums/ErrorMessages";
import { ResponseCodes } from "../enums/responseCodes";

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

    if (error?.name === "ValidationError") {
      const validationMessage = Object.values(error.errors || {})
        .map((issue: any) => issue.message)
        .filter(Boolean)
        .join(", ");

      return await this.sendResponse(
        ResponseCodes.BAD_REQUEST,
        validationMessage || "Validation failed",
        null
      );
    }

    if (error?.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
      return await this.sendResponse(
        ResponseCodes.CONFLICT,
        `${duplicateField} already exists`,
        null
      );
    }

    return await this.sendResponse(
      500,
      ErrorMessages.InternalServerError,
      null
    )
  }
  static handleResponse(res: Response, responseObj: any) {
    res.status(responseObj.code).json(responseObj);
  }
}

export default ResponseHandler
