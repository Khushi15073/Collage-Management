"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionController = void 0;
const permission_service_1 = require("../services/permission.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
const responseCodes_1 = require("../enums/responseCodes");
class PermissionController {
    constructor() {
        this.permissionService = new permission_service_1.PermissionService();
    }
    async createPermission(req, res) {
        try {
            const permissionData = req.body;
            const newPermission = await this.permissionService.createPermission(permissionData);
            responseHandler_1.default.handleResponse(res, newPermission);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getAllPermission(req, res) {
        try {
            const permission = await this.permissionService.getAllPermission();
            responseHandler_1.default.handleResponse(res, permission);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getPermissionById(req, res) {
        try {
            const permissionId = req.params.id;
            const permission = await this.permissionService.getPermissionById(permissionId);
            if (permission) {
                responseHandler_1.default.handleResponse(res, permission);
            }
            responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.NOT_FOUND, "permission not found");
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async updatePermission(req, res) {
        try {
            const permissionId = req.params.id;
            const updatePermission = req.body;
            const updatePermisssion = await this.permissionService.UpdatePermission(permissionId, updatePermission);
            responseHandler_1.default.handleResponse(res, updatePermisssion);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async deletePermission(req, res) {
        try {
            const permissionId = req.params.id;
            const deleted = await this.permissionService.deletePermission(permissionId);
            return responseHandler_1.default.handleResponse(res, deleted);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.PermissionController = PermissionController;
