import { ResponseCodes } from "../enums/responseCodes";
import { PermissionFactory } from "../factory/permission.factory";
import { CreatePermissionDTO, UpdatePermissionDTO } from "../interfaces/permission.interface";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";


export class PermissionService {

    private permissionFactory = new PermissionFactory()

    public async createPermission(permissionData: CreatePermissionDTO) {
        try {
            if (!permissionData.name) {
                throw AppError.badRequest("Missing required fields")
            }

            await this.permissionFactory.findUserByName(permissionData.name)
            const result = await this.permissionFactory.createPermission(permissionData)

            return result
        } catch (error) {
            throw error
        }
    }

    public async getAllPermission() {
        try {
            const permissions = await this.permissionFactory.getAllPermission();
            if (!permissions || permissions.length === 0) {
                throw AppError.notFound("no permission")
            }
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "permission updated successfully",
                permissions
            )

        } catch (error) {
            throw error
        }
    }

    public async getPermissionById(permissionId: string) {
        const permission = await this.permissionFactory.getpermissionById(permissionId);
        return ResponseHandler.sendResponse(
            ResponseCodes.OK,
            "successfully fetched permission by id",
            permission

        )
    }

    public async UpdatePermission(permissionId: string, upatedPermission: UpdatePermissionDTO) {
        try {
            const updatedPermission = await this.permissionFactory.updatePermission(permissionId, upatedPermission)
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "User updated successfully",
                updatedPermission,
            );
        } catch (error) {
            throw error
        }
    }

    public async deletePermission(permissionId: string) {
        try {
            const permission = await this.permissionFactory.getpermissionById(permissionId);
            if (!permission) {
                throw AppError.notFound("User Not Found");
            }
            const result = await this.permissionFactory.deletePermission(permissionId)
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "Successfully deleted",
                result)
                ;
        } catch (error) {
            throw error
        }
    }
}