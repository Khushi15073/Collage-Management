"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleController = void 0;
const role_service_1 = require("../services/role.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class RoleController {
    constructor() {
        this.roleService = new role_service_1.roleService();
    }
    async createRole(req, res) {
        try {
            const roleData = req.body;
            const newRole = await this.roleService.createRole(roleData);
            responseHandler_1.default.handleResponse(res, newRole);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getAllRole(req, res) {
        try {
            const result = await this.roleService.getAllRole();
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getRoleById(req, res) {
        try {
            const roleId = req.params.id;
            const result = await this.roleService.getRoleById(roleId);
            // if (role) {
            responseHandler_1.default.handleResponse(res, result);
            // }
            // ResponseHandler.sendResponse(ResponseCodes.NOT_FOUND, "permission not found");
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async updateRole(req, res) {
        try {
            const roleId = req.params.id;
            const updatedRole = req.body;
            const result = await this.roleService.UpdateRole(roleId, updatedRole);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async deleteRole(req, res) {
        try {
            const permissionId = req.params.id;
            const deleted = await this.roleService.deleteRole(permissionId);
            return responseHandler_1.default.handleResponse(res, deleted);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.RoleController = RoleController;
