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
const role_schema_1 = require("../schemas/role.schema");
const accessControl_1 = require("../constants/accessControl");
class PermissionService {
    constructor() {
        this.permissionFactory = new permission_factory_1.PermissionFactory();
    }
    async assignAllPermissionsToAdminRole() {
        const allPermissions = await this.permissionFactory.getAllPermission();
        const adminRole = await role_schema_1.RoleModel.findOne({ name: "admin" });
        if (!adminRole) {
            return;
        }
        adminRole.permissions = allPermissions.map((permission) => permission._id);
        await adminRole.save();
    }
    mapPermissionWithMetadata(permission) {
        const definition = (0, accessControl_1.getPermissionDefinition)(permission.name);
        return {
            _id: permission._id,
            name: permission.name,
            label: (definition === null || definition === void 0 ? void 0 : definition.label) || (0, accessControl_1.formatPermissionLabel)(permission.name),
            section: (definition === null || definition === void 0 ? void 0 : definition.section) || "Custom",
            description: (definition === null || definition === void 0 ? void 0 : definition.description) || permission.description || "",
        };
    }
    async createPermission(permissionData) {
        try {
            if (!permissionData.name) {
                throw errorClass_1.AppError.badRequest("Missing required fields");
            }
            await this.permissionFactory.findUserByName(permissionData.name);
            const result = await this.permissionFactory.createPermission(permissionData);
            await this.assignAllPermissionsToAdminRole();
            return result;
        }
        catch (error) {
            throw error;
        }
    }
    async getAllPermission() {
        try {
            const permissions = await this.permissionFactory.getAllPermission();
            const normalizedPermissions = permissions
                .map((permission) => this.mapPermissionWithMetadata(permission))
                .filter((permission) => (0, accessControl_1.getPermissionDefinition)(permission.name) != null);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "permission fetched successfully", normalizedPermissions);
        }
        catch (error) {
            throw error;
        }
    }
    async syncDefaultPermissions() {
        try {
            const existingPermissions = await this.permissionFactory.getAllPermission();
            const existingNames = new Set(existingPermissions.map((permission) => permission.name));
            for (const permission of accessControl_1.DEFAULT_PERMISSIONS) {
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
                .filter((permission) => (0, accessControl_1.getPermissionDefinition)(permission.name) != null);
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "default permissions synced successfully", normalizedPermissions);
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
