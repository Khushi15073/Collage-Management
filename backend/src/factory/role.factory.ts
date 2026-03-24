import { ResponseCodes } from "../enums/responseCodes";
import { CreateRoleDTO, UpdateRoleDTO } from "../interfaces/role.interface";
import { RoleModel } from "../schemas/role.schema";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

export class roleFactory {
    public async createRole(roleData: CreateRoleDTO) {
        try {
            const role = new RoleModel(roleData)
            await role.save()
            return ResponseHandler.sendResponse(
                ResponseCodes.CREATED,
                "User created successfully",
                role
            )
        } catch (error) {
            throw error
        }
    }

    public async findRoleByName(name: string) {
        try {
            const role = await RoleModel.findOne({ name });
            if (role) {
                throw AppError.conflict("name already in use")
            }
            return role;
        } catch (error) {
            throw error
        }
    }

    public async getAllRole() {
        try {
            const role = await RoleModel.find();
            if (!role) {
                throw AppError.notFound("Role not found")
            }
            return role

        } catch (error) {
            throw error
        }
    }

    public async getRoleById(roleId: string) {

        try {
            const role = await RoleModel.findById(roleId)
            if (!role) {
                throw AppError.notFound("Role not found")
            }
            return role;
        }
        catch (error) {
            throw error

        }
    }

    public async updateRole(
        roleId: string,
        upatedRole: UpdateRoleDTO
    ) {
        try {
            const role = await RoleModel.findByIdAndUpdate(roleId, upatedRole, {
                new: true,
            });

            if (!role) {
                throw AppError.notFound("Role not found")
            }
            return role;
        }
        catch (error) {
            throw error
        }
    }

    public async deleteRole(roleId: string) {
        try {
            const role = await RoleModel.findByIdAndDelete(roleId)
            if (!role) {
                throw AppError.notFound("role not found")
            }
            return role
        } catch (error) {
            throw error
        }
    }
}