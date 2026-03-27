import { Types } from "mongoose";
import { AttendanceModel } from "../schemas/attendance.schema";
import { CourseModel } from "../schemas/course.schema";

export class AttendanceFactory {
  async findFacultyCourses(userId: string) {
    return CourseModel.find({ instructor: userId })
      .sort({ name: 1 })
      .select("code name students")
      .populate("students", "name email phoneNumber");
  }

  async findFacultyCourseById(courseId: string, userId: string) {
    return CourseModel.findOne({ _id: courseId, instructor: userId })
      .select("code name students")
      .populate("students", "name email phoneNumber");
  }

  async findAttendanceByCourseAndDate(courseId: string, date: string) {
    return AttendanceModel.find({ course: courseId, date })
      .select("student status");
  }

  async upsertAttendanceRecords(
    facultyId: string,
    courseId: string,
    date: string,
    records: { studentId: string; status: "present" | "absent" }[]
  ) {
    if (records.length === 0) {
      return;
    }

    const facultyObjectId = new Types.ObjectId(facultyId);
    const courseObjectId = new Types.ObjectId(courseId);

    await AttendanceModel.bulkWrite(
      records.map((record) => ({
        updateOne: {
          filter: {
            course: courseObjectId,
            student: new Types.ObjectId(record.studentId),
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
      }))
    );
  }
}
