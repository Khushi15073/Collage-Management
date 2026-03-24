import { ResponseCodes } from "../enums/responseCodes";
import { roleFactory } from "../factory/role.factory";
import { CreateRoleDTO, UpdateRoleDTO } from "../interfaces/role.interface";

import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

export class roleService {
    private roleFactory = new roleFactory()
    public async createRole(roleData: CreateRoleDTO) {
        try {
            if (!roleData.name) {
                throw AppError.badRequest("Missing required fields")
            }

            await this.roleFactory.findRoleByName(roleData.name)
            const result = await this.roleFactory.createRole(roleData)

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
            const UpdateRole = await this.roleFactory.updateRole(roleId, upatedRole)
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