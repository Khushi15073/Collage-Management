import express from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdminRole, requireRoleName } from "../middleware/permission.middleware";

const router = express.Router();
const dashboardController = new DashboardController();

router.get(
  "/admin",
  authMiddleware,
  requireAdminRole,
  dashboardController.getAdminDashboard.bind(dashboardController)
);

router.get(
  "/faculty",
  authMiddleware,
  requireRoleName("faculty"),
  dashboardController.getFacultyDashboard.bind(dashboardController)
);

router.get(
  "/faculty/students",
  authMiddleware,
  requireRoleName("faculty"),
  dashboardController.getFacultyStudents.bind(dashboardController)
);

router.get(
  "/student",
  authMiddleware,
  requireRoleName("student"),
  dashboardController.getStudentDashboard.bind(dashboardController)
);

export default router;
