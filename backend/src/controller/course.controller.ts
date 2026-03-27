import { Request, Response } from "express";
import { CourseService } from "../services/course.service";


import ResponseHandler from "../utility/responseHandler";
import { CreateCourseDTO, UpdateCourseDTO } from "../interfaces/course.interface";
import { IdParam } from "../interfaces/common.interface";

export class CourseController {
  private courseService = new CourseService();

  // ─────────────────────────────────────────
  // POST /api/course
  // Create a new course
  // ─────────────────────────────────────────
  async createCourse(req: Request<{}, {}, CreateCourseDTO>, res: Response) {
    try {
      const courseData = req.body;
      const result = await this.courseService.createCourse(courseData);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // ─────────────────────────────────────────
  // GET /api/course
  // Get all courses
  // ─────────────────────────────────────────
  async getAllCourses(req: Request, res: Response) {
    try {
      const result = await this.courseService.getAllCourses();
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // ─────────────────────────────────────────
  // GET /api/course/:id
  // Get single course by ID
  // ─────────────────────────────────────────
  async getCourseById(req: Request<IdParam>, res: Response) {
    try {
      const courseId = req.params.id;
      const result = await this.courseService.getCourseById(courseId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // ─────────────────────────────────────────
  // PUT /api/course/:id
  // Update a course
  // ─────────────────────────────────────────
  async updateCourse(req: Request<IdParam, {}, UpdateCourseDTO>, res: Response) {
    try {
      const courseId = req.params.id;
      const updateData = req.body;
      const result = await this.courseService.updateCourse(courseId, updateData);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  // ─────────────────────────────────────────
  // DELETE /api/course/:id
  // Delete a course
  // ─────────────────────────────────────────
  async deleteCourse(req: Request<IdParam>, res: Response) {
    try {
      const courseId = req.params.id;
      const result = await this.courseService.deleteCourse(courseId);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}