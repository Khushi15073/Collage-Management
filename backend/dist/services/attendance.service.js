"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const attendance_factory_1 = require("../factory/attendance.factory");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
function isValidDateKey(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}
class AttendanceService {
    constructor() {
        this.attendanceFactory = new attendance_factory_1.AttendanceFactory();
    }
    async getFacultyCourses(userId) {
        const courses = await this.attendanceFactory.findFacultyCourses(userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Attendance courses fetched successfully", courses.map((course) => ({
            _id: String(course._id),
            code: course.code,
            name: course.name,
            studentCount: course.students.length,
        })));
    }
    async getFacultyAttendanceSheet(userId, courseId, date) {
        if (!courseId) {
            throw errorClass_1.AppError.badRequest("Course ID is required");
        }
        if (!date || isValidDateKey(date) === false) {
            throw errorClass_1.AppError.badRequest("Valid attendance date is required");
        }
        const course = await this.attendanceFactory.findFacultyCourseById(courseId, userId);
        if (!course) {
            throw errorClass_1.AppError.notFound("Course not found for this faculty");
        }
        const existingAttendance = await this.attendanceFactory.findAttendanceByCourseAndDate(courseId, date);
        const attendanceMap = new Map(existingAttendance.map((record) => [String(record.student), record.status]));
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Attendance sheet fetched successfully", {
            course: {
                _id: String(course._id),
                code: course.code,
                name: course.name,
            },
            date,
            students: course.students.map((student) => ({
                _id: String(student._id),
                name: student.name,
                email: student.email,
                phoneNumber: student.phoneNumber,
                status: attendanceMap.get(String(student._id)) || "absent",
            })),
        });
    }
    async saveFacultyAttendance(userId, data) {
        if (!data.courseId) {
            throw errorClass_1.AppError.badRequest("Course ID is required");
        }
        if (!data.date || isValidDateKey(data.date) === false) {
            throw errorClass_1.AppError.badRequest("Valid attendance date is required");
        }
        if (Array.isArray(data.records) === false || data.records.length === 0) {
            throw errorClass_1.AppError.badRequest("Attendance records are required");
        }
        const course = await this.attendanceFactory.findFacultyCourseById(data.courseId, userId);
        if (!course) {
            throw errorClass_1.AppError.notFound("Course not found for this faculty");
        }
        const allowedStudentIds = new Set(course.students.map((student) => String(student._id)));
        const uniqueRecords = new Map();
        data.records.forEach((record) => {
            if (!record.studentId || allowedStudentIds.has(record.studentId) === false) {
                throw errorClass_1.AppError.badRequest("Attendance contains students not assigned to this course");
            }
            if (record.status !== "present" && record.status !== "absent") {
                throw errorClass_1.AppError.badRequest("Attendance status must be present or absent");
            }
            uniqueRecords.set(record.studentId, record.status);
        });
        if (uniqueRecords.size !== allowedStudentIds.size) {
            throw errorClass_1.AppError.badRequest("Attendance must be submitted for every assigned student");
        }
        await this.attendanceFactory.upsertAttendanceRecords(userId, data.courseId, data.date, Array.from(uniqueRecords.entries()).map(([studentId, status]) => ({
            studentId,
            status,
        })));
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Attendance saved successfully", {
            courseId: data.courseId,
            date: data.date,
            totalStudents: uniqueRecords.size,
        });
    }
}
exports.AttendanceService = AttendanceService;
