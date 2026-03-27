"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardFactory = void 0;
const user_schema_1 = __importDefault(require("../schemas/user.schema"));
const role_schema_1 = require("../schemas/role.schema");
const course_schema_1 = require("../schemas/course.schema");
const permission_schema_1 = require("../schemas/permission.schema");
const attendance_schema_1 = require("../schemas/attendance.schema");
class DashboardFactory {
    async getAdminDashboardSummary() {
        const [studentRole, facultyRole, adminRole] = await Promise.all([
            role_schema_1.RoleModel.findOne({ name: "student" }).select("_id"),
            role_schema_1.RoleModel.findOne({ name: "faculty" }).select("_id"),
            role_schema_1.RoleModel.findOne({ name: "admin" }).select("_id"),
        ]);
        const [totalStudents, totalFaculty, totalAdmins, totalCourses, activeCourses, fullCourses, inactiveCourses, totalPermissions, totalRoles, enrollmentSummary, recentCourses,] = await Promise.all([
            studentRole ? user_schema_1.default.countDocuments({ role: studentRole._id }) : 0,
            facultyRole ? user_schema_1.default.countDocuments({ role: facultyRole._id }) : 0,
            adminRole ? user_schema_1.default.countDocuments({ role: adminRole._id }) : 0,
            course_schema_1.CourseModel.countDocuments(),
            course_schema_1.CourseModel.countDocuments({ status: "Active" }),
            course_schema_1.CourseModel.countDocuments({ status: "Full" }),
            course_schema_1.CourseModel.countDocuments({ status: "Inactive" }),
            permission_schema_1.PermissionModel.countDocuments(),
            role_schema_1.RoleModel.countDocuments(),
            course_schema_1.CourseModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalEnrolled: { $sum: "$enrolled" },
                        totalCapacity: { $sum: "$total" },
                    },
                },
            ]),
            course_schema_1.CourseModel.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select("code name department status enrolled total")
                .populate("instructor", "name email"),
        ]);
        const totals = enrollmentSummary[0] || { totalEnrolled: 0, totalCapacity: 0 };
        return {
            counts: {
                totalStudents,
                totalFaculty,
                totalAdmins,
                totalCourses,
                activeCourses,
                fullCourses,
                inactiveCourses,
                totalPermissions,
                totalRoles,
            },
            enrollment: {
                totalEnrolled: totals.totalEnrolled,
                totalCapacity: totals.totalCapacity,
                availableSeats: Math.max(totals.totalCapacity - totals.totalEnrolled, 0),
            },
            recentCourses,
        };
    }
    async getFacultyDashboardSummary(userId) {
        const facultyCourses = await course_schema_1.CourseModel.find({ instructor: userId })
            .sort({ createdAt: -1 })
            .select("code name department schedule status enrolled total")
            .populate("instructor", "name email");
        const totals = facultyCourses.reduce((accumulator, course) => {
            accumulator.totalStudents += course.enrolled;
            accumulator.totalCapacity += course.total;
            if (course.status === "Active") {
                accumulator.activeCourses += 1;
            }
            if (course.status === "Full") {
                accumulator.fullCourses += 1;
            }
            return accumulator;
        }, {
            totalStudents: 0,
            totalCapacity: 0,
            activeCourses: 0,
            fullCourses: 0,
        });
        return {
            counts: {
                totalCourses: facultyCourses.length,
                totalStudents: totals.totalStudents,
                activeCourses: totals.activeCourses,
                fullCourses: totals.fullCourses,
                availableSeats: Math.max(totals.totalCapacity - totals.totalStudents, 0),
            },
            courses: facultyCourses,
        };
    }
    async getFacultyStudents(userId) {
        const facultyCourses = await course_schema_1.CourseModel.find({ instructor: userId })
            .sort({ name: 1 })
            .select("name code students")
            .populate("students", "name email phoneNumber gender");
        const studentMap = new Map();
        facultyCourses.forEach((course) => {
            course.students.forEach((student) => {
                const studentId = String(student._id);
                const existingStudent = studentMap.get(studentId);
                const courseSummary = {
                    _id: String(course._id),
                    code: course.code,
                    name: course.name,
                };
                if (existingStudent) {
                    existingStudent.courses.push(courseSummary);
                    return;
                }
                studentMap.set(studentId, {
                    _id: studentId,
                    name: student.name,
                    email: student.email,
                    phoneNumber: student.phoneNumber,
                    gender: student.gender,
                    courses: [courseSummary],
                });
            });
        });
        return {
            totalStudents: studentMap.size,
            courses: facultyCourses.map((course) => ({
                _id: String(course._id),
                code: course.code,
                name: course.name,
            })),
            students: Array.from(studentMap.values()).sort((first, second) => first.name.localeCompare(second.name)),
        };
    }
    async getStudentDashboardSummary(userId) {
        const [studentCourses, attendanceRecords] = await Promise.all([
            course_schema_1.CourseModel.find({ students: userId })
                .sort({ name: 1 })
                .select("code name schedule credits status department")
                .populate("instructor", "name email"),
            attendance_schema_1.AttendanceModel.find({ student: userId })
                .sort({ date: -1, createdAt: -1 })
                .populate("course", "code name"),
        ]);
        const courseAttendanceMap = new Map();
        attendanceRecords.forEach((record) => {
            var _a;
            const courseId = String(((_a = record.course) === null || _a === void 0 ? void 0 : _a._id) || "");
            if (!courseId) {
                return;
            }
            const existing = courseAttendanceMap.get(courseId) || {
                code: record.course.code,
                name: record.course.name,
                present: 0,
                total: 0,
            };
            existing.total += 1;
            if (record.status === "present") {
                existing.present += 1;
            }
            courseAttendanceMap.set(courseId, existing);
        });
        const totalAttendanceClasses = attendanceRecords.length;
        const classesAttended = attendanceRecords.filter((record) => record.status === "present").length;
        const classesMissed = totalAttendanceClasses - classesAttended;
        const overallAttendance = totalAttendanceClasses > 0
            ? Number(((classesAttended / totalAttendanceClasses) * 100).toFixed(1))
            : 0;
        return {
            counts: {
                enrolledCourses: studentCourses.length,
                totalCredits: studentCourses.reduce((sum, course) => sum + course.credits, 0),
                overallAttendance,
                classesAttended,
                classesMissed,
            },
            enrolledCourses: studentCourses.map((course) => {
                var _a;
                return ({
                    _id: String(course._id),
                    code: course.code,
                    name: course.name,
                    department: course.department,
                    schedule: course.schedule,
                    credits: course.credits,
                    status: course.status,
                    instructorName: ((_a = course.instructor) === null || _a === void 0 ? void 0 : _a.name) || "Unassigned",
                });
            }),
            courseAttendance: Array.from(courseAttendanceMap.values())
                .map((course) => ({
                ...course,
                percentage: course.total > 0
                    ? Number(((course.present / course.total) * 100).toFixed(1))
                    : 0,
            }))
                .sort((first, second) => second.percentage - first.percentage),
            recentAttendance: attendanceRecords.slice(0, 6).map((record) => {
                var _a, _b;
                return ({
                    _id: String(record._id),
                    date: record.date,
                    courseCode: ((_a = record.course) === null || _a === void 0 ? void 0 : _a.code) || "-",
                    courseName: ((_b = record.course) === null || _b === void 0 ? void 0 : _b.name) || "Unknown Course",
                    status: record.status,
                });
            }),
        };
    }
}
exports.DashboardFactory = DashboardFactory;
