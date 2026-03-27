"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class DashboardController {
    constructor() {
        this.dashboardService = new dashboard_service_1.DashboardService();
    }
    async getAdminDashboard(req, res) {
        try {
            const result = await this.dashboardService.getAdminDashboardSummary();
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getFacultyDashboard(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.dashboardService.getFacultyDashboardSummary(userId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getFacultyStudents(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.dashboardService.getFacultyStudents(userId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getStudentDashboard(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.dashboardService.getStudentDashboardSummary(userId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.DashboardController = DashboardController;
