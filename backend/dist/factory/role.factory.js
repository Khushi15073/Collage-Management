"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleFactory = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const role_schema_1 = require("../schemas/role.schema");
const errorClass_1 = require("../utility/errorClass");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class roleFactory {
    async createRole(roleData) {
        try {
            const role = new role_schema_1.RoleModel(roleData);
            await role.save();
            await role.populate("permissions");
            return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.CREATED, "Role created successfully", role);
        }
        catch (error) {
            throw error;
        }
    }
    async findRoleByName(name) {
        try {
            const role = await role_schema_1.RoleModel.findOne({ name });
            if (role) {
                throw errorClass_1.AppError.conflict("name already in use");
            }
            return role;
        }
        catch (error) {
            throw error;
        }
    }
    async getAllRole() {
        try {
            const role = await role_schema_1.RoleModel.find().populate("permissions");
            if (!role) {
                throw errorClass_1.AppError.notFound("Role not found");
            }
            return role;
        }
        catch (error) {
            throw error;
        }
    }
    async getRoleById(roleId) {
        try {
            const role = await role_schema_1.RoleModel.findById(roleId).populate("permissions");
            if (!role) {
                throw errorClass_1.AppError.notFound("Role not found");
            }
            return role;
        }
        catch (error) {
            throw error;
        }
    }
    async updateRole(roleId, upatedRole) {
        try {
            const role = await role_schema_1.RoleModel.findByIdAndUpdate(roleId, upatedRole, {
                new: true,
                runValidators: true,
            });
            if (!role) {
                throw errorClass_1.AppError.notFound("Role not found");
            }
            await role.populate("permissions");
            return role;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteRole(roleId) {
        try {
            const role = await role_schema_1.RoleModel.findByIdAndDelete(roleId);
            if (!role) {
                throw errorClass_1.AppError.notFound("role not found");
            }
            return role;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.roleFactory = roleFactory;
