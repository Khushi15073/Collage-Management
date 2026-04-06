"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegreeService = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const degree_factory_1 = require("../factory/degree.factory");
const course_factory_1 = require("../factory/course.factory");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class DegreeService {
    constructor() {
        this.degreeFactory = new degree_factory_1.DegreeFactory();
        this.courseFactory = new course_factory_1.CourseFactory();
    }
    buildEnrollmentYears() {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 10 }, (_, index) => currentYear - index);
    }
    decorateDegree(degree) {
        if (!degree) {
            return degree;
        }
        const normalizedDegree = typeof degree.toObject === "function"
            ? degree.toObject()
            : degree;
        return {
            ...normalizedDegree,
            availableEnrollmentYears: this.buildEnrollmentYears(),
        };
    }
    async ensureCourseCodesAvailable(sections, degreeId) {
        const codes = sections.flatMap((section) => section.courses.map((course) => course.code.trim().toUpperCase()));
        const conflicts = await this.courseFactory.findCoursesByCodes(codes, degreeId);
        if (conflicts.length > 0) {
            throw errorClass_1.AppError.conflict(`Course with code "${conflicts[0].code}" already exists`);
        }
    }
    validateSections(type, count, sections) {
        if (!Array.isArray(sections) || sections.length !== count) {
            throw errorClass_1.AppError.badRequest(`Expected ${count} ${type} sections.`);
        }
        const courseNames = new Set();
        const courseCodes = new Set();
        sections.forEach((section, index) => {
            if (!section.label || !section.key) {
                throw errorClass_1.AppError.badRequest(`Section ${index + 1} is missing required metadata.`);
            }
            if (!Array.isArray(section.courses) || section.courses.length === 0) {
                throw errorClass_1.AppError.badRequest(`${section.label} requires at least one course.`);
            }
            section.courses.forEach((course, courseIndex) => {
                var _a, _b;
                if (!((_a = course.name) === null || _a === void 0 ? void 0 : _a.trim()) || !((_b = course.code) === null || _b === void 0 ? void 0 : _b.trim())) {
                    throw errorClass_1.AppError.badRequest(`${section.label} course ${courseIndex + 1} must include name and code.`);
                }
                const name = course.name.trim().toLowerCase();
                const code = course.code.trim().toUpperCase();
                if (courseNames.has(name)) {
                    throw errorClass_1.AppError.badRequest("Course already exists");
                }
                courseNames.add(name);
                if (courseCodes.has(code)) {
                    throw errorClass_1.AppError.badRequest("Course code must be unique");
                }
                courseCodes.add(code);
            });
        });
    }
    async createDegree(data, createdBy) {
        var _a, _b;
        if (!((_a = data.degreeName) === null || _a === void 0 ? void 0 : _a.trim())) {
            throw errorClass_1.AppError.badRequest("Degree name is required");
        }
        if (!((_b = data.department) === null || _b === void 0 ? void 0 : _b.trim())) {
            throw errorClass_1.AppError.badRequest("Department / Stream is required");
        }
        if (data.type !== "semester" && data.type !== "year") {
            throw errorClass_1.AppError.badRequest("Type must be semester or year");
        }
        if (data.type === "semester" && ![2, 4, 6, 8].includes(data.count)) {
            throw errorClass_1.AppError.badRequest("Semester wise degrees only allow 2, 4, 6, or 8 semesters");
        }
        if (data.type === "year" && ![1, 2, 3, 4, 5].includes(data.count)) {
            throw errorClass_1.AppError.badRequest("Year wise degrees only allow between 1 and 5 years");
        }
        this.validateSections(data.type, data.count, data.sections);
        await this.ensureCourseCodesAvailable(data.sections);
        const degree = await this.degreeFactory.createDegree({
            ...data,
            degreeName: data.degreeName.trim(),
            department: data.department.trim(),
            createdBy,
            sections: data.sections.map((section) => ({
                ...section,
                key: section.key.trim(),
                label: section.label.trim(),
                courses: section.courses.map((course) => ({
                    name: course.name.trim(),
                    code: course.code.trim().toUpperCase(),
                })),
            })),
        });
        const populatedDegree = await this.degreeFactory.findDegreeById(String(degree._id));
        await this.courseFactory.replaceCoursesForDegree(String(degree._id), degree.department, degree.sections);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.CREATED, "Degree created successfully", this.decorateDegree(populatedDegree));
    }
    async getAllDegrees() {
        const degrees = await this.degreeFactory.findAllDegrees();
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Degrees fetched successfully", degrees.map((degree) => this.decorateDegree(degree)));
    }
    async getDegreeById(id) {
        const degree = await this.degreeFactory.findDegreeById(id);
        if (!degree) {
            throw errorClass_1.AppError.notFound("Degree not found");
        }
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Degree fetched successfully", this.decorateDegree(degree));
    }
    async updateDegree(id, data) {
        var _a, _b, _c, _d, _e, _f;
        const existing = await this.degreeFactory.findDegreeById(id);
        if (!existing) {
            throw errorClass_1.AppError.notFound("Degree not found");
        }
        const nextType = (_a = data.type) !== null && _a !== void 0 ? _a : existing.type;
        const nextCount = (_b = data.count) !== null && _b !== void 0 ? _b : existing.count;
        const nextSections = (_c = data.sections) !== null && _c !== void 0 ? _c : existing.sections;
        if (nextType === "semester" && ![2, 4, 6, 8].includes(nextCount)) {
            throw errorClass_1.AppError.badRequest("Semester wise degrees only allow 2, 4, 6, or 8 semesters");
        }
        if (nextType === "year" && ![1, 2, 3, 4, 5].includes(nextCount)) {
            throw errorClass_1.AppError.badRequest("Year wise degrees only allow between 1 and 5 years");
        }
        this.validateSections(nextType, nextCount, nextSections);
        await this.ensureCourseCodesAvailable(nextSections, id);
        const normalizedData = {
            ...data,
            degreeName: (_d = data.degreeName) === null || _d === void 0 ? void 0 : _d.trim(),
            department: (_e = data.department) === null || _e === void 0 ? void 0 : _e.trim(),
            sections: (_f = data.sections) === null || _f === void 0 ? void 0 : _f.map((section) => ({
                ...section,
                key: section.key.trim(),
                label: section.label.trim(),
                courses: section.courses.map((course) => ({
                    name: course.name.trim(),
                    code: course.code.trim().toUpperCase(),
                })),
            })),
        };
        const updated = await this.degreeFactory.updateDegreeById(id, normalizedData);
        if (!updated) {
            throw errorClass_1.AppError.notFound("Degree not found");
        }
        await this.courseFactory.replaceCoursesForDegree(id, updated.department, updated.sections);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Degree updated successfully", this.decorateDegree(updated));
    }
    async deleteDegree(id) {
        const existing = await this.degreeFactory.findDegreeById(id);
        if (!existing) {
            throw errorClass_1.AppError.notFound("Degree not found");
        }
        await this.courseFactory.deleteCoursesByDegreeId(id);
        await this.degreeFactory.deleteDegreeById(id);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Degree deleted successfully", null);
    }
}
exports.DegreeService = DegreeService;
