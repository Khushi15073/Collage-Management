"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const attendance_service_1 = require("../services/attendance.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class AttendanceController {
    constructor() {
        this.attendanceService = new attendance_service_1.AttendanceService();
    }
    async getFacultyCourses(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.attendanceService.getFacultyCourses(userId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getFacultyAttendanceSheet(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const courseId = typeof req.query.courseId === "string" ? req.query.courseId : "";
            const date = typeof req.query.date === "string" ? req.query.date : "";
            const result = await this.attendanceService.getFacultyAttendanceSheet(userId, courseId, date);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async saveFacultyAttendance(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.attendanceService.saveFacultyAttendance(userId, req.body);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.AttendanceController = AttendanceController;
