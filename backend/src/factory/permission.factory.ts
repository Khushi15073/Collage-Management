import { ResponseCodes } from "../enums/responseCodes";
import { CreatePermissionDTO, UpdatePermissionDTO } from "../interfaces/permission.interface";
import { PermissionModel } from "../schemas/permission.schema";
import { AppError } from "../utility/errorClass";
import ResponseHandler from "../utility/responseHandler";

export class PermissionFactory {

    public async createPermission(permissionData: CreatePermissionDTO) {
        try {

            const permissions = new PermissionModel(permissionData);
            await permissions.save();

            return ResponseHandler.sendResponse(
                ResponseCodes.CREATED,
                "User created successfully",
                permissions
            )
        } catch (error) {
            throw error
        }
    }


    public async findUserByName(name: string) {
        try {
            const permission = await PermissionModel.findOne({ name });
            if (permission) {
                throw AppError.conflict("name already in use")
            }
            return permission;
        } catch (error) {
            throw error
        }
    }


    public async getAllPermission() {
        try {
            const permisssions = await PermissionModel.find();
            if (!permisssions) {
                throw AppError.notFound("permission not found")
            }
            return permisssions

        } catch (error) {
            throw error
        }
    }

    public async getpermissionById(permissionId: string) {
        try {


            const permission = await PermissionModel.findById(permissionId)
            if (!permission) {
                throw AppError.notFound("Permission not found")
            }
            return permission;
        } catch (error) {
            throw error
        }
    }

    public async updatePermission(
        permissionId: string,
        upatedPermission: UpdatePermissionDTO
    ) {
        try {
            {
                const permission = await PermissionModel.findByIdAndUpdate(permissionId, upatedPermission, {
                    new: true,
                });

                if (!permission) {
                    throw AppError.notFound("permission not found")
                }
                return permission;
            }
        } catch (error) {
            throw error
        }
    }

    public async deletePermission(permissionId: string) {
        try {
            const permission = await PermissionModel.findByIdAndDelete(permissionId)
            if (!permission) {
                throw AppError.notFound("permission not found")
            }
            return permission
        } catch (error) {
            throw error
        }
    }
}

