"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signJwtHs256 = void 0;
const crypto_1 = __importDefault(require("crypto"));
const base64UrlEncode = (input) => {
    const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
    return buf
        .toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
};
const hmacSha256Base64Url = (data, secret) => {
    const sig = crypto_1.default.createHmac("sha256", secret).update(data).digest();
    return base64UrlEncode(sig);
};
const signJwtHs256 = (payload, secret, options) => {
    if (!secret) {
        throw new Error("JWT secret is missing (set JWT_SECRET)");
    }
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = { ...payload, iat: now };
    if (options === null || options === void 0 ? void 0 : options.expiresInSeconds) {
        fullPayload.exp = now + options.expiresInSeconds;
    }
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = hmacSha256Base64Url(signingInput, secret);
    return `${signingInput}.${signature}`;
};
exports.signJwtHs256 = signJwtHs256;
