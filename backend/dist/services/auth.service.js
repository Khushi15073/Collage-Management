"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const errorClass_1 = require("../utility/errorClass");
const auth_factory_1 = require("../factory/auth.factory");
const responseHandler_1 = __importDefault(require("../utility/responseHandler"));
const responseCodes_1 = require("../enums/responseCodes");
class authService {
    constructor() {
        this.authFactory = new auth_factory_1.authFactory();
    }
    async login(email, password) {
        const user = await this.authFactory.findUserByEmail(email);
        if (!user) {
            throw errorClass_1.AppError.unauthorized("Invalid email or password");
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw errorClass_1.AppError.unauthorized("Invalid email or password");
        }
        const tokens = this.authFactory.generateTokens(user._id.toString());
        await this.authFactory.saveRefreshToken(user._id.toString(), tokens.refreshToken);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Login successful", {
            user,
            ...tokens
        });
    }
    async refreshToken(oldToken) {
        if (!oldToken) {
            throw errorClass_1.AppError.unauthorized("Refresh token missing");
        }
        const decoded = this.authFactory.verifyRefreshToken(oldToken);
        const tokenInDb = await this.authFactory.findRefreshToken(oldToken);
        if (!tokenInDb) {
            throw errorClass_1.AppError.forbidden("Invalid refresh token");
        }
        const accessToken = this.authFactory.generateAccessToken(decoded.userId);
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "success", {
            accessToken,
            refreshToken: oldToken
        });
    }
    async getCurrentUser(userId) {
        if (!userId) {
            throw errorClass_1.AppError.unauthorized("Unauthorized");
        }
        const user = await this.authFactory.findUserById(userId);
        if (!user) {
            throw errorClass_1.AppError.unauthorized("Unauthorized");
        }
        return responseHandler_1.default.sendResponse(responseCodes_1.ResponseCodes.OK, "Current user fetched successfully", { user });
    }
    async logout(refreshToken) {
        await this.authFactory.deleteRefreshToken(refreshToken);
    }
}
exports.authService = authService;
