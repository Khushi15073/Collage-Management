import express from "express";
import { AttendanceController } from "../controller/attendance.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireRoleName } from "../middleware/permission.middleware";

const router = express.Router();
const attendanceController = new AttendanceController();

router.get(
  "/faculty/courses",
  authMiddleware,
  requireRoleName("faculty"),
  attendanceController.getFacultyCourses.bind(attendanceController)
);

router.get(
  "/faculty/sheet",
  authMiddleware,
  requireRoleName("faculty"),
  attendanceController.getFacultyAttendanceSheet.bind(attendanceController)
);

router.post(
  "/faculty",
  authMiddleware,
  requireRoleName("faculty"),
  attendanceController.saveFacultyAttendance.bind(attendanceController)
);

export default router;
