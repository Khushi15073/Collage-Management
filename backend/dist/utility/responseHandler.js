"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorClass_1 = require("./errorClass");
class ResponseHandler {
    static async sendResponse(code, message, data = null) {
        return {
            code,
            message,
            data,
        };
    }
    static async handleError(error) {
        if (error instanceof errorClass_1.AppError) {
            return await this.sendResponse(error.statusCode, error.message, error.data);
        }
        return await this.sendResponse(500, error.message || 'Internal server error', null);
    }
    static handleResponse(res, responseObj) {
        res.status(responseObj.code).json(responseObj);
    }
}
exports.default = ResponseHandler;
