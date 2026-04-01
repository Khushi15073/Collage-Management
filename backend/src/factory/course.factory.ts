import { Types } from "mongoose";
import { CourseModel } from "../schemas/course.schema";
import { CreateCourseDTO, UpdateCourseDTO } from "../interfaces/course.interface";
import type { IDegreeSection } from "../interfaces/degree.interface";
import { DegreeModel } from "../schemas/degree.schema";

export class CourseFactory {

  // ── Find course by code (for duplicate check) ──
  async findCourseByCode(code: string) {
    return CourseModel.findOne({ code });
  }

  async findCoursesByCodes(codes: string[], excludeDegreeId?: string) {
    const query: Record<string, unknown> = {
      code: { $in: codes },
    };

    if (excludeDegreeId) {
      query.sourceDegree = { $ne: excludeDegreeId };
    }

    return CourseModel.find(query).select("code");
  }

  async findFacultyScheduleConflict(
    instructorId: string,
    schedule: string,
    excludeCourseId?: string
  ) {
    const query: Record<string, unknown> = {
      instructor: instructorId,
      schedule,
    };

    if (excludeCourseId) {
      query._id = { $ne: excludeCourseId };
    }

    return CourseModel.findOne(query).populate("instructor", "name email");
  }

  // ── Find course by ID ──
  async findCourseById(id: string) {
    return CourseModel
      .findById(id)
      .populate("instructor", "name email")
      .populate("students", "name email phoneNumber gender");
  }

  // ── Get all courses ──
  async findAllCourses() {
    return CourseModel
      .find()
      .populate("instructor", "name email")
      .populate("students", "name email phoneNumber gender");
  }

  // ── Create a new course ──
  async createCourse(data: CreateCourseDTO) {
    return CourseModel.create(data);
  }

  async replaceCoursesForDegree(
    degreeId: string,
    department: string,
    sections: IDegreeSection[]
  ) {
    const degreeObjectId = new Types.ObjectId(degreeId);
    const degreeCourses = sections.flatMap((section) =>
      section.courses.map((course) => ({
        code: course.code,
        name: course.name,
        department,
        sourceSectionKey: section.key,
      }))
    );

    const incomingCodes = degreeCourses.map((course) => course.code);

    await CourseModel.deleteMany({
      sourceDegree: degreeObjectId,
      code: { $nin: incomingCodes },
    });

    if (degreeCourses.length === 0) {
      return [];
    }

    await CourseModel.bulkWrite(
      degreeCourses.map((course) => ({
        updateOne: {
          filter: {
            sourceDegree: degreeObjectId,
            code: course.code,
          },
          update: {
            $set: {
              name: course.name,
              department: course.department,
              sourceSectionKey: course.sourceSectionKey,
            },
            $setOnInsert: {
              schedule: "",
              credits: 3,
              total: 50,
              enrolled: 0,
              students: [],
              status: "Active",
              sourceDegree: degreeObjectId,
            },
          },
          upsert: true,
        },
      }))
    );

    return CourseModel.find({ sourceDegree: degreeObjectId })
      .populate("instructor", "name email")
      .populate("students", "name email phoneNumber gender");
  }

  async deleteCoursesByDegreeId(degreeId: string) {
    return CourseModel.deleteMany({ sourceDegree: degreeId });
  }

  async syncCoursesFromDegrees() {
    const degrees = await DegreeModel.find().select("department sections");

    for (const degree of degrees) {
      await this.replaceCoursesForDegree(
        String(degree._id),
        degree.department,
        degree.sections as IDegreeSection[]
      );
    }
  }

  // ── Update course by ID ──
  async updateCourseById(id: string, data: UpdateCourseDTO) {
    return CourseModel
      .findByIdAndUpdate(id, data, { new: true })
      .populate("instructor", "name email")
      .populate("students", "name email phoneNumber gender");
  }

  // ── Delete course by ID ──
  async deleteCourseById(id: string) {
    return CourseModel.findByIdAndDelete(id);
  }
}
