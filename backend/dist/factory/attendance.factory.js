"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceFactory = void 0;
const mongoose_1 = require("mongoose");
const attendance_schema_1 = require("../schemas/attendance.schema");
const course_schema_1 = require("../schemas/course.schema");
class AttendanceFactory {
    async findFacultyCourses(userId) {
        return course_schema_1.CourseModel.find({ instructor: userId })
            .sort({ name: 1 })
            .select("code name students")
            .populate("students", "name email phoneNumber");
    }
    async findFacultyCourseById(courseId, userId) {
        return course_schema_1.CourseModel.findOne({ _id: courseId, instructor: userId })
            .select("code name students")
            .populate("students", "name email phoneNumber");
    }
    async findAttendanceByCourseAndDate(courseId, date) {
        return attendance_schema_1.AttendanceModel.find({ course: courseId, date })
            .select("student status");
    }
    async upsertAttendanceRecords(facultyId, courseId, date, records) {
        if (records.length === 0) {
            return;
        }
        const facultyObjectId = new mongoose_1.Types.ObjectId(facultyId);
        const courseObjectId = new mongoose_1.Types.ObjectId(courseId);
        await attendance_schema_1.AttendanceModel.bulkWrite(records.map((record) => ({
            updateOne: {
                filter: {
                    course: courseObjectId,
                    student: new mongoose_1.Types.ObjectId(record.studentId),
                    date,
                },
                update: {
                    $set: {
                        faculty: facultyObjectId,
                        status: record.status,
                    },
                },
                upsert: true,
            },
        })));
    }
}
exports.AttendanceFactory = AttendanceFactory;
