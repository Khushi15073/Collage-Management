"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitMiddleware = rateLimitMiddleware;
const responseCodes_1 = require("../enums/responseCodes");
const requestStore = new Map();
function buildClientKey(req) {
    var _a;
    const forwardedFor = req.headers["x-forwarded-for"];
    const ip = typeof forwardedFor === "string"
        ? (_a = forwardedFor.split(",")[0]) === null || _a === void 0 ? void 0 : _a.trim()
        : req.ip || "unknown";
    return `${req.method}:${req.baseUrl}${req.path}:${ip}`;
}
function rateLimitMiddleware(options) {
    return (req, res, next) => {
        const now = Date.now();
        const key = buildClientKey(req);
        const currentEntry = requestStore.get(key);
        if (!currentEntry || currentEntry.resetAt <= now) {
            requestStore.set(key, {
                count: 1,
                resetAt: now + options.windowMs,
            });
        }
        else {
            currentEntry.count += 1;
        }
        const entry = requestStore.get(key);
        const remaining = Math.max(options.maxRequests - entry.count, 0);
        const retryAfterSeconds = Math.max(Math.ceil((entry.resetAt - now) / 1000), 0);
        res.setHeader("X-RateLimit-Limit", String(options.maxRequests));
        res.setHeader("X-RateLimit-Remaining", String(remaining));
        res.setHeader("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));
        if (entry.count > options.maxRequests) {
            res.setHeader("Retry-After", String(retryAfterSeconds));
            res.status(responseCodes_1.ResponseCodes.TOO_MANY_REQUESTS).json({
                code: responseCodes_1.ResponseCodes.TOO_MANY_REQUESTS,
                message: "Rate limit exceeded. Please wait before making another request.",
                data: {
                    limit: options.maxRequests,
                    remaining,
                    retryAfterSeconds,
                },
            });
            return;
        }
        next();
    };
}
