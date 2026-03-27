"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const course_factory_1 = require("../factory/course.factory");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
const responseCodes_1 = require("../enums/responseCodes");
class CourseService {
    constructor() {
        this.courseFactory = new course_factory_1.CourseFactory();
    }
    normalizeStudentIds(studentIds) {
        if (!studentIds) {
            return [];
        }
        return Array.from(new Set(studentIds.filter((studentId) => typeof studentId === "string" && studentId.trim() !== "")));
    }
    buildEnrollmentData(totalSeats, studentIds, requestedStatus) {
        if (studentIds.length > totalSeats) {
            throw errorClass_1.AppError.badRequest("Enrolled students cannot exceed total seats");
        }
        const enrolled = studentIds.length;
        const status = enrolled >= totalSeats
            ? "Full"
            : (requestedStatus || "Active");
        return {
            students: studentIds,
            enrolled,
            status,
        };
    }
    // ─────────────────────────────────────────
    // Create course
    // Validates: code must be unique
    // ─────────────────────────────────────────
    async createCourse(data) {
        // ✅ Validation: check required fields
        if (!data.code || !data.name || !data.department || !data.credits || !data.total) {
            throw errorClass_1.AppError.badRequest("code, name, department, credits and total seats are required");
        }
        // ✅ Validation: course code must be unique
        const existing = await this.courseFactory.findCourseByCode(data.code);
        if (existing) {
            throw errorClass_1.AppError.conflict(`Course with code "${data.code}" already exists`);
        }
        // ✅ Validation: credits must be positive
        if (data.credits <= 0) {
            throw errorClass_1.AppError.badRequest("Credits must be greater than 0");
        }
        // ✅ Validation: total seats must be positive
        if (data.total <= 0) {
            throw errorClass_1.AppError.badRequest("Total seats must be greater than 0");
        }
        const studentIds = this.normalizeStudentIds(data.students);
        const enrollmentData = this.buildEnrollmentData(data.total, studentIds, data.status);
        // ── DB operation via factory ──
        const course = await this.courseFactory.createCourse({
            ...data,
            ...enrollmentData,
        });
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.CREATED, "Course created successfully", course);
    }
    // ─────────────────────────────────────────
    // Get all courses
    // No validation needed
    // ─────────────────────────────────────────
    async getAllCourses() {
        const courses = await this.courseFactory.findAllCourses();
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Courses fetched successfully", courses);
    }
    // ─────────────────────────────────────────
    // Get single course by ID
    // Validates: course must exist
    // ─────────────────────────────────────────
    async getCourseById(id) {
        // ✅ Validation: id must be provided
        if (!id) {
            throw errorClass_1.AppError.badRequest("Course ID is required");
        }
        // ── DB operation via factory ──
        const course = await this.courseFactory.findCourseById(id);
        // ✅ Validation: course must exist
        if (!course) {
            throw errorClass_1.AppError.notFound("Course not found");
        }
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Course fetched successfully", course);
    }
    // ─────────────────────────────────────────
    // Update course
    // Validates: course must exist, code unique if changed
    // ─────────────────────────────────────────
    async updateCourse(id, data) {
        var _a, _b, _c, _d;
        // ✅ Validation: course must exist
        const existing = await this.courseFactory.findCourseById(id);
        if (!existing) {
            throw errorClass_1.AppError.notFound("Course not found");
        }
        // ✅ Validation: if code is being changed, new code must be unique
        if (data.code && data.code !== existing.code) {
            const codeExists = await this.courseFactory.findCourseByCode(data.code);
            if (codeExists) {
                throw errorClass_1.AppError.conflict(`Course with code "${data.code}" already exists`);
            }
        }
        // ✅ Validation: credits must be positive if provided
        if (data.credits !== undefined && data.credits <= 0) {
            throw errorClass_1.AppError.badRequest("Credits must be greater than 0");
        }
        // ✅ Validation: total seats must be positive if provided
        if (data.total !== undefined && data.total <= 0) {
            throw errorClass_1.AppError.badRequest("Total seats must be greater than 0");
        }
        const nextTotal = (_a = data.total) !== null && _a !== void 0 ? _a : existing.total;
        const nextStudentIds = this.normalizeStudentIds((_b = data.students) !== null && _b !== void 0 ? _b : (_c = existing.students) === null || _c === void 0 ? void 0 : _c.map((student) => String(student._id || student)));
        const enrollmentData = this.buildEnrollmentData(nextTotal, nextStudentIds, (_d = data.status) !== null && _d !== void 0 ? _d : existing.status);
        // ── DB operation via factory ──
        const updated = await this.courseFactory.updateCourseById(id, {
            ...data,
            ...enrollmentData,
        });
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Course updated successfully", updated);
    }
    // ─────────────────────────────────────────
    // Delete course
    // Validates: course must exist
    // ─────────────────────────────────────────
    async deleteCourse(id) {
        // ✅ Validation: course must exist
        const existing = await this.courseFactory.findCourseById(id);
        if (!existing) {
            throw errorClass_1.AppError.notFound("Course not found");
        }
        // ── DB operation via factory ──
        await this.courseFactory.deleteCourseById(id);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Course deleted successfully", null);
    }
}
exports.CourseService = CourseService;
