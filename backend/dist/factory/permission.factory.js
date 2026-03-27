"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionFactory = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const permission_schema_1 = require("../schemas/permission.schema");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class PermissionFactory {
    async createPermission(permissionData) {
        try {
            const permissions = new permission_schema_1.PermissionModel(permissionData);
            await permissions.save();
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.CREATED, "User created successfully", permissions);
        }
        catch (error) {
            throw error;
        }
    }
    async findUserByName(name) {
        try {
            const permission = await permission_schema_1.PermissionModel.findOne({ name });
            if (permission) {
                throw errorClass_1.AppError.conflict("name already in use");
            }
            return permission;
        }
        catch (error) {
            throw error;
        }
    }
    async getAllPermission() {
        try {
            const permisssions = await permission_schema_1.PermissionModel.find();
            if (!permisssions) {
                throw errorClass_1.AppError.notFound("permission not found");
            }
            return permisssions;
        }
        catch (error) {
            throw error;
        }
    }
    async getpermissionById(permissionId) {
        try {
            const permission = await permission_schema_1.PermissionModel.findById(permissionId);
            if (!permission) {
                throw errorClass_1.AppError.notFound("Permission not found");
            }
            return permission;
        }
        catch (error) {
            throw error;
        }
    }
    async updatePermission(permissionId, upatedPermission) {
        try {
            {
                const permission = await permission_schema_1.PermissionModel.findByIdAndUpdate(permissionId, upatedPermission, {
                    new: true,
                });
                if (!permission) {
                    throw errorClass_1.AppError.notFound("permission not found");
                }
                return permission;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async deletePermission(permissionId) {
        try {
            const permission = await permission_schema_1.PermissionModel.findByIdAndDelete(permissionId);
            if (!permission) {
                throw errorClass_1.AppError.notFound("permission not found");
            }
            return permission;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.PermissionFactory = PermissionFactory;
