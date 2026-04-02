"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authFactory = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_1 = __importDefault(require("../schemas/user.schema"));
const env_config_1 = require("../config/env.config");
const token_schema_1 = require("../schemas/token.schema");
const errorClass_1 = require("../utility/errorClass");
class authFactory {
    generateTokens(userId) {
        const accessTokenExpiry = "15m";
        const refreshTokenExpiry = "7d";
        const accessToken = jsonwebtoken_1.default.sign({ userId }, env_config_1.config.JWT_SECRET, { expiresIn: accessTokenExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({ userId }, env_config_1.config.JWT_REFRESH_SECRET, { expiresIn: refreshTokenExpiry });
        return {
            accessToken,
            accessTokenExpiresIn: accessTokenExpiry,
            refreshToken,
            refreshTokenExpiresIn: refreshTokenExpiry,
        };
    }
    generateAccessToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, env_config_1.config.JWT_SECRET, { expiresIn: "15m" });
    }
    verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_config_1.config.JWT_REFRESH_SECRET);
        }
        catch (error) {
            throw errorClass_1.AppError.unauthorized("Invalid or expired refresh token");
        }
    }
    async saveRefreshToken(userId, token) {
        return token_schema_1.TokenModel.create({
            userId,
            token,
            expiresAt: new Date(Date.now() + 7 * 24 * 3600000),
        });
    }
    async findRefreshToken(token) {
        return token_schema_1.TokenModel.findOne({ token });
    }
    async updateRefreshToken(oldToken, newToken) {
        return token_schema_1.TokenModel.findOneAndUpdate({ token: oldToken }, { token: newToken });
    }
    async deleteRefreshToken(token) {
        return token_schema_1.TokenModel.deleteOne({ token });
    }
    async findUserByEmail(email) {
        return user_schema_1.default
            .findOne({ email })
            .select("+password")
            .populate({
            path: "role",
            populate: { path: "permissions" },
        });
    }
    async findUserById(userId) {
        return user_schema_1.default.findById(userId).populate({
            path: "role",
            populate: { path: "permissions" },
        });
    }
}
exports.authFactory = authFactory;
