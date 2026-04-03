"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseFactory = void 0;
const mongoose_1 = require("mongoose");
const course_schema_1 = require("../schemas/course.schema");
const degree_schema_1 = require("../schemas/degree.schema");
class CourseFactory {
    applyEnrollment(course, studentIds) {
        const uniqueStudents = Array.from(new Set(studentIds));
        course.students = uniqueStudents.map((studentId) => new mongoose_1.Types.ObjectId(studentId));
        course.enrolled = uniqueStudents.length;
        course.status = uniqueStudents.length >= course.total ? "Full" : "Active";
    }
    // ── Find course by code (for duplicate check) ──
    async findCourseByCode(code) {
        return course_schema_1.CourseModel.findOne({ code });
    }
    async findCoursesByCodes(codes, excludeDegreeId) {
        const query = {
            code: { $in: codes },
        };
        if (excludeDegreeId) {
            query.sourceDegree = { $ne: excludeDegreeId };
        }
        return course_schema_1.CourseModel.find(query).select("code");
    }
    async findFacultyScheduleConflict(instructorId, schedule, excludeCourseId) {
        const query = {
            instructor: instructorId,
            schedule,
        };
        if (excludeCourseId) {
            query._id = { $ne: excludeCourseId };
        }
        return course_schema_1.CourseModel.findOne(query).populate("instructor", "name email");
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
    async assignStudentToDegreeCourses(degreeId, studentId) {
        const courses = await course_schema_1.CourseModel.find({ sourceDegree: new mongoose_1.Types.ObjectId(degreeId) });
        for (const course of courses) {
            const currentStudentIds = (course.students || []).map((item) => String(item));
            if (currentStudentIds.includes(studentId)) {
                continue;
            }
            this.applyEnrollment(course, [...currentStudentIds, studentId]);
            await course.save();
        }
    }
    async removeStudentFromDegreeCourses(degreeId, studentId) {
        const courses = await course_schema_1.CourseModel.find({ sourceDegree: new mongoose_1.Types.ObjectId(degreeId) });
        for (const course of courses) {
            const nextStudentIds = (course.students || [])
                .map((item) => String(item))
                .filter((id) => id !== studentId);
            this.applyEnrollment(course, nextStudentIds);
            await course.save();
        }
    }
    async removeStudentFromAllCourses(studentId) {
        const courses = await course_schema_1.CourseModel.find({ students: new mongoose_1.Types.ObjectId(studentId) });
        for (const course of courses) {
            const nextStudentIds = (course.students || [])
                .map((item) => String(item))
                .filter((id) => id !== studentId);
            this.applyEnrollment(course, nextStudentIds);
            await course.save();
        }
    }
    async replaceCoursesForDegree(degreeId, department, sections) {
        const degreeObjectId = new mongoose_1.Types.ObjectId(degreeId);
        const degreeCourses = sections.flatMap((section) => section.courses.map((course) => ({
            code: course.code,
            name: course.name,
            department,
            sourceSectionKey: section.key,
        })));
        const incomingCodes = degreeCourses.map((course) => course.code);
        await course_schema_1.CourseModel.deleteMany({
            sourceDegree: degreeObjectId,
            code: { $nin: incomingCodes },
        });
        if (degreeCourses.length === 0) {
            return [];
        }
        await course_schema_1.CourseModel.bulkWrite(degreeCourses.map((course) => ({
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
                        credits: 0,
                        total: 50,
                        enrolled: 0,
                        students: [],
                        status: "Active",
                        sourceDegree: degreeObjectId,
                    },
                },
                upsert: true,
            },
        })));
        return course_schema_1.CourseModel.find({ sourceDegree: degreeObjectId })
            .populate("instructor", "name email")
            .populate("students", "name email phoneNumber gender");
    }
    async deleteCoursesByDegreeId(degreeId) {
        return course_schema_1.CourseModel.deleteMany({ sourceDegree: degreeId });
    }
    async syncCoursesFromDegrees() {
        const degrees = await degree_schema_1.DegreeModel.find().select("department sections");
        for (const degree of degrees) {
            await this.replaceCoursesForDegree(String(degree._id), degree.department, degree.sections);
        }
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
