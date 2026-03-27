import { CourseModel } from "../schemas/course.schema";
import { CreateCourseDTO, UpdateCourseDTO } from "../interfaces/course.interface";

export class CourseFactory {

  // ── Find course by code (for duplicate check) ──
  async findCourseByCode(code: string) {
    return CourseModel.findOne({ code });
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
