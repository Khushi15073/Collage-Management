"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const dashboard_factory_1 = require("../factory/dashboard.factory");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class DashboardService {
    constructor() {
        this.dashboardFactory = new dashboard_factory_1.DashboardFactory();
    }
    async getAdminDashboardSummary() {
        const summary = await this.dashboardFactory.getAdminDashboardSummary();
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Dashboard fetched successfully", summary);
    }
    async getFacultyDashboardSummary(userId) {
        const summary = await this.dashboardFactory.getFacultyDashboardSummary(userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Faculty dashboard fetched successfully", summary);
    }
    async getFacultyStudents(userId) {
        const students = await this.dashboardFactory.getFacultyStudents(userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Faculty students fetched successfully", students);
    }
    async getStudentDashboardSummary(userId) {
        const summary = await this.dashboardFactory.getStudentDashboardSummary(userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Student dashboard fetched successfully", summary);
    }
}
exports.DashboardService = DashboardService;
