import type { Request, Response } from "express";
import { DegreeService } from "../services/degree.service";
import ResponseHandler from "../utility/responseHandler";
import type { CreateDegreeDTO, UpdateDegreeDTO } from "../interfaces/degree.interface";
import type { IdParam } from "../interfaces/common.interface";

export class DegreeController {
  private degreeService = new DegreeService();

  async createDegree(req: Request<{}, {}, CreateDegreeDTO>, res: Response) {
    try {
      const createdBy = String((req as any).user?.userId || "");
      const result = await this.degreeService.createDegree(req.body, createdBy);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getAllDegrees(req: Request, res: Response) {
    try {
      const result = await this.degreeService.getAllDegrees();
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async getDegreeById(req: Request<IdParam>, res: Response) {
    try {
      const result = await this.degreeService.getDegreeById(req.params.id);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async updateDegree(req: Request<IdParam, {}, UpdateDegreeDTO>, res: Response) {
    try {
      const result = await this.degreeService.updateDegree(req.params.id, req.body);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }

  async deleteDegree(req: Request<IdParam>, res: Response) {
    try {
      const result = await this.degreeService.deleteDegree(req.params.id);
      ResponseHandler.handleResponse(res, result);
    } catch (error) {
      const errorResponse = await ResponseHandler.handleError(
        error instanceof Error ? error : new Error("Unknown error occurred")
      );
      ResponseHandler.handleResponse(res, errorResponse);
    }
  }
}
