"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseFactory = void 0;
const course_schema_1 = require("../schemas/course.schema");
class CourseFactory {
    // ── Find course by code (for duplicate check) ──
    async findCourseByCode(code) {
        return course_schema_1.CourseModel.findOne({ code });
    }
    // ── Find course by ID ──
    async findCourseById(id) {
        return course_schema_1.CourseModel
            .findById(id)
            .populate("instructor", "name email")
            .populate("students", "name email phoneNumber gender");
    }
    // ── Get all courses ──
    async findAllCourses() {
        return course_schema_1.CourseModel
            .find()
            .populate("instructor", "name email")
            .populate("students", "name email phoneNumber gender");
    }
    // ── Create a new course ──
    async createCourse(data) {
        return course_schema_1.CourseModel.create(data);
    }
    // ── Update course by ID ──
    async updateCourseById(id, data) {
        return course_schema_1.CourseModel
            .findByIdAndUpdate(id, data, { new: true })
            .populate("instructor", "name email")
            .populate("students", "name email phoneNumber gender");
    }
    // ── Delete course by ID ──
    async deleteCourseById(id) {
        return course_schema_1.CourseModel.findByIdAndDelete(id);
    }
}
exports.CourseFactory = CourseFactory;
