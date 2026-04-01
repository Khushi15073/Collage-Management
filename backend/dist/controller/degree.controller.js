"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DegreeController = void 0;
const degree_service_1 = require("../services/degree.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class DegreeController {
    constructor() {
        this.degreeService = new degree_service_1.DegreeService();
    }
    async createDegree(req, res) {
        var _a;
        try {
            const createdBy = String(((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || "");
            const result = await this.degreeService.createDegree(req.body, createdBy);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getAllDegrees(req, res) {
        try {
            const result = await this.degreeService.getAllDegrees();
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async getDegreeById(req, res) {
        try {
            const result = await this.degreeService.getDegreeById(req.params.id);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async updateDegree(req, res) {
        try {
            const result = await this.degreeService.updateDegree(req.params.id, req.body);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async deleteDegree(req, res) {
        try {
            const result = await this.degreeService.deleteDegree(req.params.id);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.DegreeController = DegreeController;
