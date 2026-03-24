import { Request, Response } from "express";
import { roleService } from "../services/role.service";
import ResponseHandler from "../utility/responseHandler";
import { CreateRoleDTO } from "../interfaces/role.interface";
import { IdParam } from "../interfaces/common.interface";


export class RoleController {
    private roleService = new roleService()
    async createRole(req: Request<{}, {}, CreateRoleDTO>, res: Response) {
        try {
            const roleData = req.body;
            const newRole = await this.roleService.createRole(roleData)
            ResponseHandler.handleResponse(res, newRole);
        } catch (error: any) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async getAllRole(req: Request, res: Response) {
        try {
            const result = await this.roleService.getAllRole();
            ResponseHandler.handleResponse(res, result);
        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async getRoleById(req: Request<IdParam>, res: Response) {
        try {
            const roleId = req.params.id
            const result = await this.roleService.getRoleById(roleId)
            // if (role) {
            ResponseHandler.handleResponse(res, result);
            // }
            // ResponseHandler.sendResponse(ResponseCodes.NOT_FOUND, "permission not found");

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error occurred"),
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }
    async updateRole(req: Request<IdParam>,
        res: Response,) {
        try {
            const roleId = req.params.id
            const updatedRole = req.body;
            const result = await this.roleService.UpdateRole(roleId, updatedRole)
            ResponseHandler.handleResponse(res, result)

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error")
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

    async deleteRole(req: Request<IdParam>, res: Response) {
        try {
            const permissionId = req.params.id;
            const deleted = await this.roleService.deleteRole(permissionId)
            return ResponseHandler.handleResponse(res, deleted)

        } catch (error) {
            const errorResponse = await ResponseHandler.handleError(
                error instanceof Error ? error : new Error("Unknown error")
            );
            ResponseHandler.handleResponse(res, errorResponse);
        }
    }

}