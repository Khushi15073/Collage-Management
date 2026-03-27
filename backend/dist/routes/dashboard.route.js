"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dashboard_controller_1 = require("../controller/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const dashboardController = new dashboard_controller_1.DashboardController();
router.get("/admin", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, dashboardController.getAdminDashboard.bind(dashboardController));
router.get("/faculty", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("faculty"), dashboardController.getFacultyDashboard.bind(dashboardController));
router.get("/faculty/students", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("faculty"), dashboardController.getFacultyStudents.bind(dashboardController));
router.get("/student", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireRoleName)("student"), dashboardController.getStudentDashboard.bind(dashboardController));
exports.default = router;
