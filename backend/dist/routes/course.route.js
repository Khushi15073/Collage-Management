"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const course_controller_1 = require("../controller/course.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const courseController = new course_controller_1.CourseController();
router.post("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("create_courses"), courseController.createCourse.bind(courseController));
router.get("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("view_courses"), courseController.getAllCourses.bind(courseController));
router.get("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("view_courses"), (req, res) => courseController.getCourseById(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("update_courses"), (req, res) => courseController.updateCourse(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("delete_courses"), (req, res) => courseController.deleteCourse(req, res));
exports.default = router;
