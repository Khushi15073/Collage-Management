"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddleware = void 0;
const errorClass_1 = require("../utility/errorClass");
const ErrorMessages_1 = require("../enums/ErrorMessages");
const errorMiddleware = (err, req, res, next) => {
    var _a;
    console.error(err);
    if (err instanceof errorClass_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            data: (_a = err.data) !== null && _a !== void 0 ? _a : null,
        });
    }
    res.status(500).json({
        success: false,
        message: ErrorMessages_1.ErrorMessages.InternalServerError,
        data: null,
    });
};
exports.errorMiddleware = errorMiddleware;
