import { Request, Response, NextFunction } from "express";
import { AppError } from "../utility/errorClass";
import { ErrorMessages } from "../enums/ErrorMessages";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      data: err.data ?? null,
    });
  }

  res.status(500).json({
    success: false,
    message: ErrorMessages.InternalServerError,
    data: null,
  });
};

  
