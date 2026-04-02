import { ResponseCodes } from "../enums/responseCodes";
import { roleFactory } from "../factory/role.factory";
import { CreateRoleDTO, UpdateRoleDTO } from "../interfaces/role.interface";
import { PermissionModel } from "../schemas/permission.schema";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

export class roleService {
    private roleFactory = new roleFactory()
    public async createRole(roleData: CreateRoleDTO) {
        try {
            const normalizedName = roleData.name?.trim().toLowerCase().replace(/\s+/g, "_");

            if (!normalizedName) {
                throw AppError.badRequest("Missing required fields")
            }

            if (roleData.permissions && roleData.permissions.length > 0) {
                const permissionCount = await PermissionModel.countDocuments({
                    _id: { $in: roleData.permissions },
                });

                if (permissionCount !== roleData.permissions.length) {
                    throw AppError.badRequest("One or more permissions are invalid");
                }
            }

            await this.roleFactory.findRoleByName(normalizedName)
            const result = await this.roleFactory.createRole({
                ...roleData,
                name: normalizedName,
                description: roleData.description?.trim() || undefined,
            })

            return result
        } catch (error) {
            throw error
        }
    }

    public async getAllRole() {
        try {
            const role = await this.roleFactory.getAllRole();
            if (!role || role.length === 0) {
                throw AppError.notFound("no role")
            }
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "role updated successfully",
                role
            )

        } catch (error) {
            throw error
        }
    }

    public async getRoleById(roleId: string) {
        const role = await this.roleFactory.getRoleById(roleId);
        return ResponseHandler.sendResponse(
            ResponseCodes.OK,
            "successfully fetched Role by id",
            role

        )
    }

    public async UpdateRole(roleId: string, upatedRole: UpdateRoleDTO) {
        try {
            const normalizedName =
                upatedRole.name?.trim().toLowerCase().replace(/\s+/g, "_");

            if (upatedRole.permissions) {
                const permissionCount = await PermissionModel.countDocuments({
                    _id: { $in: upatedRole.permissions },
                });

                if (permissionCount !== upatedRole.permissions.length) {
                    throw AppError.badRequest("One or more permissions are invalid");
                }
            }

            if (normalizedName) {
                const existingRole = await this.roleFactory.getRoleById(roleId);
                if (existingRole.name !== normalizedName) {
                    await this.roleFactory.findRoleByName(normalizedName);
                }
            }

            const UpdateRole = await this.roleFactory.updateRole(roleId, {
                ...upatedRole,
                name: normalizedName ?? upatedRole.name,
                description:
                    upatedRole.description !== undefined
                        ? upatedRole.description.trim() || undefined
                        : undefined,
            })
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "role updated successfully",
                UpdateRole,
            );
        } catch (error) {
            throw error
        }
    }

    public async deleteRole(roleId: string) {
        try {
            const role = await this.roleFactory.getRoleById(roleId);
            if (!role) {
                throw AppError.notFound("role Not Found");
            }
            const result = await this.roleFactory.deleteRole(roleId)
            return ResponseHandler.sendResponse(
                ResponseCodes.OK,
                "Successfully deleted",
                result
            )
                ;
        } catch (error) {
            throw error
        }
    }
}
