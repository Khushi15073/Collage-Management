"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = void 0;
const notFoundMiddleware = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "API Route Not Found",
        url: req.originalUrl,
        method: req.method
    });
};
exports.notFoundMiddleware = notFoundMiddleware;
