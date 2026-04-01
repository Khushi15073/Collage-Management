"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorClass_1 = require("./errorClass");
const ErrorMessages_1 = require("../enums/ErrorMessages");
const responseCodes_1 = require("../enums/responseCodes");
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
        if ((error === null || error === void 0 ? void 0 : error.name) === "ValidationError") {
            const validationMessage = Object.values(error.errors || {})
                .map((issue) => issue.message)
                .filter(Boolean)
                .join(", ");
            return await this.sendResponse(responseCodes_1.ResponseCodes.BAD_REQUEST, validationMessage || "Validation failed", null);
        }
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            const duplicateField = Object.keys(error.keyPattern || {})[0] || "field";
            return await this.sendResponse(responseCodes_1.ResponseCodes.CONFLICT, `${duplicateField} already exists`, null);
        }
        return await this.sendResponse(500, ErrorMessages_1.ErrorMessages.InternalServerError, null);
    }
    static handleResponse(res, responseObj) {
        res.status(responseObj.code).json(responseObj);
    }
}
exports.default = ResponseHandler;
