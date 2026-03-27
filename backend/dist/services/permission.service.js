"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const permission_factory_1 = require("../factory/permission.factory");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class PermissionService {
    constructor() {
        this.permissionFactory = new permission_factory_1.PermissionFactory();
    }
    async createPermission(permissionData) {
        try {
            if (!permissionData.name) {
                throw errorClass_1.AppError.badRequest("Missing required fields");
            }
            await this.permissionFactory.findUserByName(permissionData.name);
            const result = await this.permissionFactory.createPermission(permissionData);
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getAllPermission() {
        try {
            const permissions = await this.permissionFactory.getAllPermission();
            if (!permissions || permissions.length === 0) {
                throw errorClass_1.AppError.notFound("no permission");
            }
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "permission updated successfully", permissions);
        }
        catch (error) {
            throw error;
        }
    }
    async getPermissionById(permissionId) {
        const permission = await this.permissionFactory.getpermissionById(permissionId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "successfully fetched permission by id", permission);
    }
    async UpdatePermission(permissionId, upatedPermission) {
        try {
            const updatedPermission = await this.permissionFactory.updatePermission(permissionId, upatedPermission);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "User updated successfully", updatedPermission);
        }
        catch (error) {
            throw error;
        }
    }
    async deletePermission(permissionId) {
        try {
            const permission = await this.permissionFactory.getpermissionById(permissionId);
            if (!permission) {
                throw errorClass_1.AppError.notFound("User Not Found");
            }
            const result = await this.permissionFactory.deletePermission(permissionId);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Successfully deleted", result);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.PermissionService = PermissionService;
