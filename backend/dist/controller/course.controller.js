"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const course_service_1 = require("../services/course.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class CourseController {
    constructor() {
        this.courseService = new course_service_1.CourseService();
    }
    // ─────────────────────────────────────────
    // POST /api/course
    // Create a new course
    // ─────────────────────────────────────────
    async createCourse(req, res) {
        try {
            const courseData = req.body;
            const result = await this.courseService.createCourse(courseData);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // ─────────────────────────────────────────
    // GET /api/course
    // Get all courses
    // ─────────────────────────────────────────
    async getAllCourses(req, res) {
        try {
            const result = await this.courseService.getAllCourses();
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // ─────────────────────────────────────────
    // GET /api/course/:id
    // Get single course by ID
    // ─────────────────────────────────────────
    async getCourseById(req, res) {
        try {
            const courseId = req.params.id;
            const result = await this.courseService.getCourseById(courseId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // ─────────────────────────────────────────
    // PUT /api/course/:id
    // Update a course
    // ─────────────────────────────────────────
    async updateCourse(req, res) {
        try {
            const courseId = req.params.id;
            const updateData = req.body;
            const result = await this.courseService.updateCourse(courseId, updateData);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    // ─────────────────────────────────────────
    // DELETE /api/course/:id
    // Delete a course
    // ─────────────────────────────────────────
    async deleteCourse(req, res) {
        try {
            const courseId = req.params.id;
            const result = await this.courseService.deleteCourse(courseId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.CourseController = CourseController;
