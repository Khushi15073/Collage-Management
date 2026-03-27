import { ResponseCodes } from "../enums/responseCodes";
import { SaveAttendanceDTO } from "../interfaces/attendance.interface";
import { AttendanceFactory } from "../factory/attendance.factory";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

function isValidDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export class AttendanceService {
  private attendanceFactory = new AttendanceFactory();

  async getFacultyCourses(userId: string) {
    const courses = await this.attendanceFactory.findFacultyCourses(userId);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Attendance courses fetched successfully",
      courses.map((course) => ({
        _id: String(course._id),
        code: course.code,
        name: course.name,
        studentCount: course.students.length,
      }))
    );
  }

  async getFacultyAttendanceSheet(userId: string, courseId: string, date: string) {
    if (!courseId) {
      throw AppError.badRequest("Course ID is required");
    }

    if (!date || isValidDateKey(date) === false) {
      throw AppError.badRequest("Valid attendance date is required");
    }

    const course = await this.attendanceFactory.findFacultyCourseById(courseId, userId);
    if (!course) {
      throw AppError.notFound("Course not found for this faculty");
    }

    const existingAttendance = await this.attendanceFactory.findAttendanceByCourseAndDate(courseId, date);
    const attendanceMap = new Map(
      existingAttendance.map((record) => [String(record.student), record.status])
    );

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Attendance sheet fetched successfully",
      {
        course: {
          _id: String(course._id),
          code: course.code,
          name: course.name,
        },
        date,
        students: course.students.map((student: any) => ({
          _id: String(student._id),
          name: student.name,
          email: student.email,
          phoneNumber: student.phoneNumber,
          status: attendanceMap.get(String(student._id)) || "absent",
        })),
      }
    );
  }

  async saveFacultyAttendance(userId: string, data: SaveAttendanceDTO) {
    if (!data.courseId) {
      throw AppError.badRequest("Course ID is required");
    }

    if (!data.date || isValidDateKey(data.date) === false) {
      throw AppError.badRequest("Valid attendance date is required");
    }

    if (Array.isArray(data.records) === false || data.records.length === 0) {
      throw AppError.badRequest("Attendance records are required");
    }

    const course = await this.attendanceFactory.findFacultyCourseById(data.courseId, userId);
    if (!course) {
      throw AppError.notFound("Course not found for this faculty");
    }

    const allowedStudentIds = new Set(course.students.map((student: any) => String(student._id)));
    const uniqueRecords = new Map<string, "present" | "absent">();

    data.records.forEach((record) => {
      if (!record.studentId || allowedStudentIds.has(record.studentId) === false) {
        throw AppError.badRequest("Attendance contains students not assigned to this course");
      }

      if (record.status !== "present" && record.status !== "absent") {
        throw AppError.badRequest("Attendance status must be present or absent");
      }

      uniqueRecords.set(record.studentId, record.status);
    });

    if (uniqueRecords.size !== allowedStudentIds.size) {
      throw AppError.badRequest("Attendance must be submitted for every assigned student");
    }

    await this.attendanceFactory.upsertAttendanceRecords(
      userId,
      data.courseId,
      data.date,
      Array.from(uniqueRecords.entries()).map(([studentId, status]) => ({
        studentId,
        status,
      }))
    );

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Attendance saved successfully",
      {
        courseId: data.courseId,
        date: data.date,
        totalStudents: uniqueRecords.size,
      }
    );
  }
}
