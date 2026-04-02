import { ResponseCodes } from "../enums/responseCodes";
import { PermissionFactory } from "../factory/permission.factory";
import { CreatePermissionDTO, UpdatePermissionDTO } from "../interfaces/permission.interface";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";
import { RoleModel } from "../schemas/role.schema";
import {
    DEFAULT_PERMISSIONS,
    formatPermissionLabel,
    getPermissionDefinition,
} from "../constants/accessControl";


export class PermissionService {

    private permissionFactory = new PermissionFactory()

    private async assignAllPermissionsToAdminRole() {
        const allPermissions = await this.permissionFactory.getAllPermission();
        const adminRole = await RoleModel.findOne({ name: "admin" });

        if (!adminRole) {
            return;
        }

        adminRole.permissions = allPermissions.map((permission: any) => permission._id);
        await adminRole.save();
    }

    private mapPermissionWithMetadata(permission: any) {
        const definition = getPermissionDefinition(permission.name);

        return {
            _id: permission._id,
            name: permission.name,
            label: definition?.label || formatPermissionLabel(permission.name),
            section: definition?.section || "Custom",
            description: definition?.description || permission.description || "",
        };
    }

    public async createPermission(permissionData: CreatePermissionDTO) {
        try {
            if (!permissionData.name) {
                throw AppError.badRequest("Missing required fields")
            }

            await this.permissionFactory.findUserByName(permissionData.name)
            const result = await this.permissionFactory.createPermission(permissionData)
            await this.assignAllPermissionsToAdminRole();

            return result
        } catch (error) {
            throw error
        }
    }

    public async getAllPermission() {
        try {
            const permissions = await this.permissionFactory.getAllPermission();
            const normalizedPermissions = permissions
                .map((permission) => this.mapPermissionWithMetadata(permission))
                .filter((permission) => getPermissionDefinition(permission.name) != null);
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "permission fetched successfully",
                normalizedPermissions
            )

        } catch (error) {
            throw error
        }
    }

    public async syncDefaultPermissions() {
        try {
            const existingPermissions = await this.permissionFactory.getAllPermission();
            const existingNames = new Set(existingPermissions.map((permission: any) => permission.name));

            for (const permission of DEFAULT_PERMISSIONS) {
                if (existingNames.has(permission.key)) {
                    continue;
                }

                await this.permissionFactory.createPermission({
                    name: permission.key,
                    description: permission.description,
                });
            }

            const refreshedPermissions = await this.permissionFactory.getAllPermission();
            await this.assignAllPermissionsToAdminRole();
            const normalizedPermissions = refreshedPermissions
                .map((permission) => this.mapPermissionWithMetadata(permission))
                .filter((permission) => getPermissionDefinition(permission.name) != null);

            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "default permissions synced successfully",
                normalizedPermissions
            );
        } catch (error) {
            throw error;
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
