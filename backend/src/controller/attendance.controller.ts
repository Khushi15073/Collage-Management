import { Request, Response } from "express";
import { AttendanceService } from "../services/attendance.service";
import ResponseHandler from "../utility/responseHandler";
import { SaveAttendanceDTO } from "../interfaces/attendance.interface";

export class AttendanceController {
  private attendanceService = new AttendanceService();

  async getFacultyCourses(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const result = await this.attendanceService.getFacultyCourses(userId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getFacultyAttendanceSheet(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const courseId =
        typeof req.query.courseId === "string" ? req.query.courseId : "";
      const date = typeof req.query.date === "string" ? req.query.date : "";

      const result = await this.attendanceService.getFacultyAttendanceSheet(
        userId,
        courseId,
        date
      );
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async saveFacultyAttendance(
    req: Request<{}, {}, SaveAttendanceDTO>,
    res: Response
  ) {
    try {
      const userId = (req as any).user?.userId;
      const result = await this.attendanceService.saveFacultyAttendance(
        userId,
        req.body
      );
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}
