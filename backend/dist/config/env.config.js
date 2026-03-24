"use strict";
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
try {
    require("dotenv").config();
}
catch {
}
const envConfig = Object.freeze({
    PORT: Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8000),
    MONGODB_URI: (_b = process.env.MONGODB_URI) !== null && _b !== void 0 ? _b : "",
    JWT_SECRET: (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : "",
});
exports.default = envConfig;
