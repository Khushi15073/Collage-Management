import { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service";
import ResponseHandler from "../utility/responseHandler";

export class DashboardController {
  private dashboardService = new DashboardService();

  async getAdminDashboard(req: Request, res: Response) {
    try {
      const result = await this.dashboardService.getAdminDashboardSummary();
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getFacultyDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const result = await this.dashboardService.getFacultyDashboardSummary(userId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getFacultyStudents(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const result = await this.dashboardService.getFacultyStudents(userId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getStudentDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const result = await this.dashboardService.getStudentDashboardSummary(userId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}
