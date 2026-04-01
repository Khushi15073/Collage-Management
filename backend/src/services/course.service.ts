import { CourseFactory } from "../factory/course.factory";
import { CreateCourseDTO, UpdateCourseDTO } from "../interfaces/course.interface";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";
import { ResponseCodes } from "../enums/responseCodes";

export class CourseService {
  private courseFactory = new CourseFactory();

  private normalizeSchedule(schedule?: string) {
    if (typeof schedule !== "string") {
      return "";
    }

    return schedule.trim().replace(/\s+/g, " ");
  }

  private normalizeInstructorId(instructor?: string | { _id?: string }) {
    if (typeof instructor === "string") {
      return instructor.trim();
    }

    if (instructor && typeof instructor === "object" && typeof instructor._id === "string") {
      return instructor._id;
    }

    return "";
  }

  private async ensureFacultyScheduleAvailable(
    instructorId: string,
    schedule: string,
    excludeCourseId?: string
  ) {
    if (!instructorId || !schedule) {
      return;
    }

    const conflictingCourse = await this.courseFactory.findFacultyScheduleConflict(
      instructorId,
      schedule,
      excludeCourseId
    );

    if (conflictingCourse) {
      throw AppError.conflict(
        `This faculty is already assigned  for the same schedule`
      );
    }
  }

  private normalizeStudentIds(studentIds?: string[]) {
    if (!studentIds) {
      return [];
    }

    return Array.from(
      new Set(studentIds.filter((studentId) => typeof studentId === "string" && studentId.trim() !== ""))
    );
  }

  private buildEnrollmentData(
    totalSeats: number,
    studentIds: string[],
    requestedStatus?: string
  ) {
    if (studentIds.length > totalSeats) {
      throw AppError.badRequest("Enrolled students cannot exceed total seats");
    }

    const enrolled = studentIds.length;
    const status =
      enrolled >= totalSeats
        ? "Full"
        : ((requestedStatus || "Active") as "Active" | "Inactive" | "Full");

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
  async createCourse(data: CreateCourseDTO) {
    const normalizedSchedule = this.normalizeSchedule(data.schedule);
    const normalizedInstructorId = this.normalizeInstructorId(data.instructor);

    // ✅ Validation: check required fields
    if (!data.code || !data.name || !data.department || !data.credits || !data.total) {
      throw AppError.badRequest("code, name, department, credits and total seats are required");
    }

    // ✅ Validation: course code must be unique
    const existing = await this.courseFactory.findCourseByCode(data.code);
    if (existing) {
      throw AppError.conflict(`Course with code "${data.code}" already exists`);
    }

    // ✅ Validation: credits must be positive
    if (data.credits <= 0) {
      throw AppError.badRequest("Credits must be greater than 0");
    }

    // ✅ Validation: total seats must be positive
    if (data.total <= 0) {
      throw AppError.badRequest("Total seats must be greater than 0");
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

    return ResponseHandler.sendResponse(
      ResponseCodes.CREATED,
      "Course created successfully",
      course
    );
  }

  // ─────────────────────────────────────────
  // Get all courses
  // No validation needed
  // ─────────────────────────────────────────
  async getAllCourses() {
    const courses = await this.courseFactory.findAllCourses();

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Courses fetched successfully",
      courses
    );
  }

  // ─────────────────────────────────────────
  // Get single course by ID
  // Validates: course must exist
  // ─────────────────────────────────────────
  async getCourseById(id: string) {

    // ✅ Validation: id must be provided
    if (!id) {
      throw AppError.badRequest("Course ID is required");
    }

    // ── DB operation via factory ──
    const course = await this.courseFactory.findCourseById(id);

    // ✅ Validation: course must exist
    if (!course) {
      throw AppError.notFound("Course not found");
    }

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Course fetched successfully",
      course
    );
  }

  // ─────────────────────────────────────────
  // Update course
  // Validates: course must exist, code unique if changed
  // ─────────────────────────────────────────
  async updateCourse(id: string, data: UpdateCourseDTO) {

    // ✅ Validation: course must exist
    const existing = await this.courseFactory.findCourseById(id);
    if (!existing) {
      throw AppError.notFound("Course not found");
    }

    // ✅ Validation: if code is being changed, new code must be unique
    if (data.code && data.code !== existing.code) {
      const codeExists = await this.courseFactory.findCourseByCode(data.code);
      if (codeExists) {
        throw AppError.conflict(`Course with code "${data.code}" already exists`);
      }
    }

    // ✅ Validation: credits must be positive if provided
    if (data.credits !== undefined && data.credits <= 0) {
      throw AppError.badRequest("Credits must be greater than 0");
    }

    // ✅ Validation: total seats must be positive if provided
    if (data.total !== undefined && data.total <= 0) {
      throw AppError.badRequest("Total seats must be greater than 0");
    }

    const nextSchedule = this.normalizeSchedule(data.schedule ?? existing.schedule);
    const nextInstructorId = this.normalizeInstructorId(data.instructor ?? (existing.instructor as any));

    await this.ensureFacultyScheduleAvailable(nextInstructorId, nextSchedule, id);

    const nextTotal = data.total ?? existing.total;
    const nextStudentIds = this.normalizeStudentIds(
      data.students ?? existing.students?.map((student: any) => String(student._id || student))
    );
    const enrollmentData = this.buildEnrollmentData(nextTotal, nextStudentIds, data.status ?? existing.status);

    // ── DB operation via factory ──
    const updated = await this.courseFactory.updateCourseById(id, {
      ...data,
      schedule: nextSchedule,
      instructor: nextInstructorId,
      ...enrollmentData,
    });

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Course updated successfully",
      updated
    );
  }

  // ─────────────────────────────────────────
  // Delete course
  // Validates: course must exist
  // ─────────────────────────────────────────
  async deleteCourse(id: string) {

    // ✅ Validation: course must exist
    const existing = await this.courseFactory.findCourseById(id);
    if (!existing) {
      throw AppError.notFound("Course not found");
    }

    // ── DB operation via factory ──
    await this.courseFactory.deleteCourseById(id);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Course deleted successfully",
      null
    );
  }
}
