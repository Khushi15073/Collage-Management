import { Request, Response } from "express";
import { PermissionService } from "../services/permission.service";
import ResponseHandler from "../utility/responseHandler";
import { ResponseCodes } from "../enums/responseCodes";
import { IPermission } from "../interfaces/permission.interface";
import { IdParam } from "../interfaces/common.interface";

export class PermissionController {

    private permissionService = new PermissionService()


    async createPermission(req: Request<{}, {}, IPermission>, res: Response) {
        try {
            const permissionData = req.body;
            const newPermission = await this.permissionService.createPermission(permissionData)
            ResponseHandler.handleResponse(res, newPermission);
        } catch (error: any) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async getAllPermission(req: Request, res: Response) {
        try {
            const permission = await this.permissionService.getAllPermission();
            ResponseHandler.handleResponse(res, permission);
        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async syncDefaultPermissions(req: Request, res: Response) {
        try {
            const permissions = await this.permissionService.syncDefaultPermissions();
            ResponseHandler.handleResponse(res, permissions);
        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async getPermissionById(req: Request<IdParam>, res: Response) {
        try {
            const permissionId = req.params.id
            const permission = await this.permissionService.getPermissionById(permissionId)
            if (permission) {
                ResponseHandler.handleResponse(res, permission);
            }
            ResponseHandler.sendResponse(ResponseCodes.NOT_FOUND, "permission not found");

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async updatePermission(req: Request<IdParam>, res: Response,) {
        try {
            const permissionId = req.params.id as string
            const updatePermission = req.body;
            const updatePermisssion = await this.permissionService.UpdatePermission(permissionId, updatePermission)
            ResponseHandler.handleResponse(res, updatePermisssion)

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error")
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async deletePermission(req: Request<IdParam>, res: Response) {
        try {
            const permissionId = req.params.id as string;
            const deleted = await this.permissionService.deletePermission(permissionId)
            return ResponseHandler.handleResponse(res, deleted)

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error")
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }
}
