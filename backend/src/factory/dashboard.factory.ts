import UserModel from "../schemas/user.schema";
import { RoleModel } from "../schemas/role.schema";
import { CourseModel } from "../schemas/course.schema";
import { PermissionModel } from "../schemas/permission.schema";
import { AttendanceModel } from "../schemas/attendance.schema";

export class DashboardFactory {
  async getAdminDashboardSummary() {
    const [studentRole, facultyRole, adminRole] = await Promise.all([
      RoleModel.findOne({ name: "student" }).select("_id"),
      RoleModel.findOne({ name: "faculty" }).select("_id"),
      RoleModel.findOne({ name: "admin" }).select("_id"),
    ]);

    const [
      totalStudents,
      totalFaculty,
      totalAdmins,
      totalCourses,
      activeCourses,
      fullCourses,
      inactiveCourses,
      totalPermissions,
      totalRoles,
      enrollmentSummary,
      recentCourses,
    ] = await Promise.all([
      studentRole ? UserModel.countDocuments({ role: studentRole._id }) : 0,
      facultyRole ? UserModel.countDocuments({ role: facultyRole._id }) : 0,
      adminRole ? UserModel.countDocuments({ role: adminRole._id }) : 0,
      CourseModel.countDocuments(),
      CourseModel.countDocuments({ status: "Active" }),
      CourseModel.countDocuments({ status: "Full" }),
      CourseModel.countDocuments({ status: "Inactive" }),
      PermissionModel.countDocuments(),
      RoleModel.countDocuments(),
      CourseModel.aggregate([
        {
          $group: {
            _id: null,
            totalEnrolled: { $sum: "$enrolled" },
            totalCapacity: { $sum: "$total" },
          },
        },
      ]),
      CourseModel.find()
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

  async getFacultyDashboardSummary(userId: string) {
    const facultyCourses = await CourseModel.find({ instructor: userId })
      .sort({ createdAt: -1 })
      .select("code name department schedule status enrolled total")
      .populate("instructor", "name email");

    const totals = facultyCourses.reduce(
      (accumulator, course) => {
        accumulator.totalStudents += course.enrolled;
        accumulator.totalCapacity += course.total;

        if (course.status === "Active") {
          accumulator.activeCourses += 1;
        }

        if (course.status === "Full") {
          accumulator.fullCourses += 1;
        }

        return accumulator;
      },
      {
        totalStudents: 0,
        totalCapacity: 0,
        activeCourses: 0,
        fullCourses: 0,
      }
    );

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

  async getFacultyStudents(userId: string) {
    const facultyCourses = await CourseModel.find({ instructor: userId })
      .sort({ name: 1 })
      .select("name code students")
      .populate("students", "name email phoneNumber gender");

    const studentMap = new Map<
      string,
      {
        _id: string;
        name: string;
        email: string;
        phoneNumber: string;
        gender: string;
        courses: { _id: string; code: string; name: string }[];
      }
    >();

    facultyCourses.forEach((course) => {
      course.students.forEach((student: any) => {
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
      students: Array.from(studentMap.values()).sort((first, second) =>
        first.name.localeCompare(second.name)
      ),
    };
  }

  async getStudentDashboardSummary(userId: string) {
    const [studentCourses, attendanceRecords] = await Promise.all([
      CourseModel.find({ students: userId })
        .sort({ name: 1 })
        .select("code name schedule credits status department")
        .populate("instructor", "name email"),
      AttendanceModel.find({ student: userId })
        .sort({ date: -1, createdAt: -1 })
        .populate("course", "code name"),
    ]);

    const courseAttendanceMap = new Map<
      string,
      {
        code: string;
        name: string;
        present: number;
        total: number;
      }
    >();

    attendanceRecords.forEach((record: any) => {
      const courseId = String(record.course?._id || "");
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
    const classesAttended = attendanceRecords.filter(
      (record: any) => record.status === "present"
    ).length;
    const classesMissed = totalAttendanceClasses - classesAttended;
    const overallAttendance =
      totalAttendanceClasses > 0
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
      enrolledCourses: studentCourses.map((course: any) => ({
        _id: String(course._id),
        code: course.code,
        name: course.name,
        department: course.department,
        schedule: course.schedule,
        credits: course.credits,
        status: course.status,
        instructorName: course.instructor?.name || "Unassigned",
      })),
      courseAttendance: Array.from(courseAttendanceMap.values())
        .map((course) => ({
          ...course,
          percentage:
            course.total > 0
              ? Number(((course.present / course.total) * 100).toFixed(1))
              : 0,
        }))
        .sort((first, second) => second.percentage - first.percentage),
      recentAttendance: attendanceRecords.slice(0, 6).map((record: any) => ({
        _id: String(record._id),
        date: record.date,
        courseCode: record.course?.code || "-",
        courseName: record.course?.name || "Unknown Course",
        status: record.status,
      })),
    };
  }
}
