import { ResponseCodes } from "../enums/responseCodes";
import { DashboardFactory } from "../factory/dashboard.factory";
import ResponseHandler from "../utility/responseHandler";

export class DashboardService {
  private dashboardFactory = new DashboardFactory();

  async getAdminDashboardSummary() {
    const summary = await this.dashboardFactory.getAdminDashboardSummary();

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Dashboard fetched successfully",
      summary
    );
  }

  async getFacultyDashboardSummary(userId: string) {
    const summary = await this.dashboardFactory.getFacultyDashboardSummary(userId);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Faculty dashboard fetched successfully",
      summary
    );
  }

  async getFacultyStudents(userId: string) {
    const students = await this.dashboardFactory.getFacultyStudents(userId);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Faculty students fetched successfully",
      students
    );
  }

  async getStudentDashboardSummary(userId: string) {
    const summary = await this.dashboardFactory.getStudentDashboardSummary(userId);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Student dashboard fetched successfully",
      summary
    );
  }
}
