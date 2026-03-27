"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const auth_service_1 = require("../services/auth.service");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
class authController {
    constructor() {
        this.authService = new auth_service_1.authService();
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.cookie("accessToken", result.data.accessToken, {
                httpOnly: true,
                secure: false,
                maxAge: 15 * 60 * 1000,
            });
            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 3600000,
            });
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error('Unknown error occurred'));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async refreshToken(req, res) {
        try {
            const oldToken = req.cookies.refreshToken;
            const result = await this.authService.refreshToken(oldToken);
            res.cookie("accessToken", result.data.accessToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 15 * 60 * 1000,
            });
            res.cookie("refreshToken", result.data.refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                secure: false,
                maxAge: 7 * 24 * 60 * 60 * 1000,
            });
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error('Unknown error occurred'));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
    async logout(req, res) {
        try {
            const token = req.cookies.refreshToken;
            if (token) {
                await this.authService.logout(token);
            }
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            res.status(200).json({ message: "Logout successful" });
        }
        catch (error) {
            throw error;
        }
    }
    async me(req, res) {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
            const result = await this.authService.getCurrentUser(userId);
            responseHandler_1.default.handleResponse(res, result);
        }
        catch (error) {
            const errorResponse = await responseHandler_1.default.handleError(error instanceof Error ? error : new Error("Unknown error occurred"));
            responseHandler_1.default.handleResponse(res, errorResponse);
        }
    }
}
exports.authController = authController;
