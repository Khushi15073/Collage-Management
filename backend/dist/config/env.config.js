"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.config = {
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: process.env.PORT,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    EMAIL_USER: (_a = process.env.EMAIL_USER) === null || _a === void 0 ? void 0 : _a.trim(),
    EMAIL_PASS: (_b = process.env.EMAIL_PASS) === null || _b === void 0 ? void 0 : _b.trim(),
    FRONTEND_URL: ((_c = process.env.FRONTEND_URL) === null || _c === void 0 ? void 0 : _c.trim()) || "http://localhost:5173",
};
