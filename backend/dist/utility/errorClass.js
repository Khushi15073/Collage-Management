"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const responseCodes_1 = require("../enums/responseCodes");
const ErrorMessages_1 = require("../enums/ErrorMessages");
class AppError extends Error {
    constructor(message, statusCode = 500, data = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.data = data;
    }
    static badRequest(message, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.BAD_REQUEST, data);
    }
    static unauthorized(message, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.UNAUTHORIZED, data);
    }
    static forbidden(message, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.FORBIDDEN, data);
    }
    static notFound(message, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.NOT_FOUND, data);
    }
    static conflict(message, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.CONFLICT, data);
    }
    static internal(message = ErrorMessages_1.ErrorMessages.InternalServerError, data = null) {
        return new AppError(message, responseCodes_1.ResponseCodes.INTERNAL_SERVER_ERROR, data);
    }
}
exports.AppError = AppError;
