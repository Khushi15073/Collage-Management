import { ResponseCodes } from "../enums/responseCodes";
import type { CreateDegreeDTO, IDegreeSection, UpdateDegreeDTO } from "../interfaces/degree.interface";
import { DegreeFactory } from "../factory/degree.factory";
import { CourseFactory } from "../factory/course.factory";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

export class DegreeService {
  private degreeFactory = new DegreeFactory();
  private courseFactory = new CourseFactory();

  private buildEnrollmentYears() {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 10 }, (_, index) => currentYear - index);
  }

  private decorateDegree<T extends { toObject?: () => any } | Record<string, any>>(degree: T | null) {
    if (!degree) {
      return degree;
    }

    const normalizedDegree =
      typeof (degree as any).toObject === "function"
        ? (degree as any).toObject()
        : degree;

    return {
      ...normalizedDegree,
      availableEnrollmentYears: this.buildEnrollmentYears(),
    };
  }

  private async ensureCourseCodesAvailable(sections: IDegreeSection[], degreeId?: string) {
    const codes = sections.flatMap((section) =>
      section.courses.map((course) => course.code.trim().toUpperCase())
    );

    const conflicts = await this.courseFactory.findCoursesByCodes(codes, degreeId);
    if (conflicts.length > 0) {
      throw AppError.conflict(
        `Course with code "${conflicts[0].code}" already exists`
      );
    }
  }

  private validateSections(type: "semester" | "year", count: number, sections: IDegreeSection[]) {
    if (!Array.isArray(sections) || sections.length !== count) {
      throw AppError.badRequest(`Expected ${count} ${type} sections.`);
    }

    const courseNames = new Set<string>();
    const courseCodes = new Set<string>();

    sections.forEach((section, index) => {
      if (!section.label || !section.key) {
        throw AppError.badRequest(`Section ${index + 1} is missing required metadata.`);
      }

      if (!Array.isArray(section.courses) || section.courses.length === 0) {
        throw AppError.badRequest(`${section.label} requires at least one course.`);
      }

      section.courses.forEach((course, courseIndex) => {
        if (!course.name?.trim() || !course.code?.trim()) {
          throw AppError.badRequest(
            `${section.label} course ${courseIndex + 1} must include name and code.`
          );
        }

        const name = course.name.trim().toLowerCase();
        const code = course.code.trim().toUpperCase();

        if (courseNames.has(name)) {
          throw AppError.badRequest("Course already exists");
        }
        courseNames.add(name);

        if (courseCodes.has(code)) {
          throw AppError.badRequest("Course code must be unique");
        }
        courseCodes.add(code);
      });
    });
  }

  async createDegree(data: CreateDegreeDTO, createdBy: string) {
    if (!data.degreeName?.trim()) {
      throw AppError.badRequest("Degree name is required");
    }

    if (!data.department?.trim()) {
      throw AppError.badRequest("Department / Stream is required");
    }

    if (data.type !== "semester" && data.type !== "year") {
      throw AppError.badRequest("Type must be semester or year");
    }

    if (data.type === "semester" && ![2, 4, 6, 8].includes(data.count)) {
      throw AppError.badRequest("Semester wise degrees only allow 2, 4, 6, or 8 semesters");
    }

    if (data.type === "year" && ![1, 2, 3, 4, 5].includes(data.count)) {
      throw AppError.badRequest("Year wise degrees only allow between 1 and 5 years");
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

    await this.courseFactory.replaceCoursesForDegree(
      String(degree._id),
      degree.department,
      degree.sections
    );

    return ResponseHandler.sendResponse(
      ResponseCodes.CREATED,
      "Degree created successfully",
      this.decorateDegree(populatedDegree)
    );
  }

  async getAllDegrees() {
    const degrees = await this.degreeFactory.findAllDegrees();

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Degrees fetched successfully",
      degrees.map((degree) => this.decorateDegree(degree))
    );
  }

  async getDegreeById(id: string) {
    const degree = await this.degreeFactory.findDegreeById(id);
    if (!degree) {
      throw AppError.notFound("Degree not found");
    }

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Degree fetched successfully",
      this.decorateDegree(degree)
    );
  }

  async updateDegree(id: string, data: UpdateDegreeDTO) {
    const existing = await this.degreeFactory.findDegreeById(id);
    if (!existing) {
      throw AppError.notFound("Degree not found");
    }

    const nextType = data.type ?? existing.type;
    const nextCount = data.count ?? existing.count;
    const nextSections = data.sections ?? existing.sections;

    if (nextType === "semester" && ![2, 4, 6, 8].includes(nextCount)) {
      throw AppError.badRequest("Semester wise degrees only allow 2, 4, 6, or 8 semesters");
    }

    if (nextType === "year" && ![1, 2, 3, 4, 5].includes(nextCount)) {
      throw AppError.badRequest("Year wise degrees only allow between 1 and 5 years");
    }

    this.validateSections(nextType, nextCount, nextSections as IDegreeSection[]);
    await this.ensureCourseCodesAvailable(nextSections as IDegreeSection[], id);

    const normalizedData: UpdateDegreeDTO = {
      ...data,
      degreeName: data.degreeName?.trim(),
      department: data.department?.trim(),
      sections: data.sections?.map((section) => ({
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
      throw AppError.notFound("Degree not found");
    }

    await this.courseFactory.replaceCoursesForDegree(
      id,
      updated.department,
      updated.sections as IDegreeSection[]
    );

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Degree updated successfully",
      this.decorateDegree(updated)
    );
  }

  async deleteDegree(id: string) {
    const existing = await this.degreeFactory.findDegreeById(id);
    if (!existing) {
      throw AppError.notFound("Degree not found");
    }

    await this.courseFactory.deleteCoursesByDegreeId(id);
    await this.degreeFactory.deleteDegreeById(id);

    return ResponseHandler.sendResponse(
      ResponseCodes.OK,
      "Degree deleted successfully",
      null
    );
  }
}
