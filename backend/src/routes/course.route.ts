import express from "express";
import { CourseController } from "../controller/course.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = express.Router();
const courseController = new CourseController();

router.post("/", authMiddleware, requirePermission("create_courses"), courseController.createCourse.bind(courseController));
router.get("/", authMiddleware, requirePermission("view_courses"), courseController.getAllCourses.bind(courseController));
router.get("/:id", authMiddleware, requirePermission("view_courses"), (req, res) => courseController.getCourseById(req as any, res));
router.put("/:id", authMiddleware, requirePermission("update_courses"), (req, res) => courseController.updateCourse(req as any, res));
router.delete("/:id", authMiddleware, requirePermission("delete_courses"), (req, res) => courseController.deleteCourse(req as any, res));

export default router;
