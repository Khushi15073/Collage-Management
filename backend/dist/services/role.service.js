"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const role_factory_1 = require("../factory/role.factory");
const permission_schema_1 = require("../schemas/permission.schema");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class roleService {
    constructor() {
        this.roleFactory = new role_factory_1.roleFactory();
    }
    async createRole(roleData) {
        try {
            if (!roleData.name) {
                throw errorClass_1.AppError.badRequest("Missing required fields");
            }
            if (roleData.permissions && roleData.permissions.length > 0) {
                const permissionCount = await permission_schema_1.PermissionModel.countDocuments({
                    _id: { $in: roleData.permissions },
                });
                if (permissionCount !== roleData.permissions.length) {
                    throw errorClass_1.AppError.badRequest("One or more permissions are invalid");
                }
            }
            await this.roleFactory.findRoleByName(roleData.name);
            const result = await this.roleFactory.createRole(roleData);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getAllRole() {
        try {
            const role = await this.roleFactory.getAllRole();
            if (!role || role.length === 0) {
                throw errorClass_1.AppError.notFound("no role");
            }
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "role updated successfully", role);
        }
        catch (error) {
            throw error;
        }
    }
    async getRoleById(roleId) {
        const role = await this.roleFactory.getRoleById(roleId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "successfully fetched Role by id", role);
    }
    async UpdateRole(roleId, upatedRole) {
        try {
            if (upatedRole.permissions) {
                const permissionCount = await permission_schema_1.PermissionModel.countDocuments({
                    _id: { $in: upatedRole.permissions },
                });
                if (permissionCount !== upatedRole.permissions.length) {
                    throw errorClass_1.AppError.badRequest("One or more permissions are invalid");
                }
            }
            const UpdateRole = await this.roleFactory.updateRole(roleId, upatedRole);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "role updated successfully", UpdateRole);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteRole(roleId) {
        try {
            const role = await this.roleFactory.getRoleById(roleId);
            if (!role) {
                throw errorClass_1.AppError.notFound("role Not Found");
            }
            const result = await this.roleFactory.deleteRole(roleId);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Successfully deleted", result);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.roleService = roleService;
