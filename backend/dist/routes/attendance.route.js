"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const attendance_controller_1 = require("../controller/attendance.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const attendanceController = new attendance_controller_1.AttendanceController();
router.get("/faculty/courses", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("faculty"), attendanceController.getFacultyCourses.bind(attendanceController));
router.get("/faculty/sheet", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("faculty"), attendanceController.getFacultyAttendanceSheet.bind(attendanceController));
router.post("/faculty", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("faculty"), attendanceController.saveFacultyAttendance.bind(attendanceController));
exports.default = router;
