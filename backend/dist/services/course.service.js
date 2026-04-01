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
    normalizeSchedule(schedule) {
        if (typeof schedule !== "string") {
            return "";
        }
        return schedule.trim().replace(/\s+/g, " ");
    }
    normalizeInstructorId(instructor) {
        if (typeof instructor === "string") {
            return instructor.trim();
        }
        if (instructor && typeof instructor === "object" && typeof instructor._id === "string") {
            return instructor._id;
        }
        return "";
    }
    async ensureFacultyScheduleAvailable(instructorId, schedule, excludeCourseId) {
        if (!instructorId || !schedule) {
            return;
        }
        const conflictingCourse = await this.courseFactory.findFacultyScheduleConflict(instructorId, schedule, excludeCourseId);
        if (conflictingCourse) {
            throw errorClass_1.AppError.conflict(`This faculty is already assigned  for the same schedule`);
        }
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
        const normalizedSchedule = this.normalizeSchedule(data.schedule);
        const normalizedInstructorId = this.normalizeInstructorId(data.instructor);
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
        await this.ensureFacultyScheduleAvailable(normalizedInstructorId, normalizedSchedule);
        const studentIds = this.normalizeStudentIds(data.students);
        const enrollmentData = this.buildEnrollmentData(data.total, studentIds, data.status);
        // ── DB operation via factory ──
        const course = await this.courseFactory.createCourse({
            ...data,
            schedule: normalizedSchedule,
            instructor: normalizedInstructorId,
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
        var _a, _b, _c, _d, _e, _f;
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
        const nextSchedule = this.normalizeSchedule((_a = data.schedule) !== null && _a !== void 0 ? _a : existing.schedule);
        const nextInstructorId = this.normalizeInstructorId((_b = data.instructor) !== null && _b !== void 0 ? _b : existing.instructor);
        await this.ensureFacultyScheduleAvailable(nextInstructorId, nextSchedule, id);
        const nextTotal = (_c = data.total) !== null && _c !== void 0 ? _c : existing.total;
        const nextStudentIds = this.normalizeStudentIds((_d = data.students) !== null && _d !== void 0 ? _d : (_e = existing.students) === null || _e === void 0 ? void 0 : _e.map((student) => String(student._id || student)));
        const enrollmentData = this.buildEnrollmentData(nextTotal, nextStudentIds, (_f = data.status) !== null && _f !== void 0 ? _f : existing.status);
        // ── DB operation via factory ──
        const updated = await this.courseFactory.updateCourseById(id, {
            ...data,
            schedule: nextSchedule,
            instructor: nextInstructorId,
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
