"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connection_1 = require("./db/connection");
const env_config_1 = __importDefault(require("./config/env.config"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// If your frontend runs on a different origin (different port/domain),
// you must allow credentials for cookies to be stored by the browser.
// Configure via: CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = new Set(((_a = process.env.CORS_ORIGIN) !== null && _a !== void 0 ? _a : "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean));
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const devLocalhost = !isProd &&
        origin != null &&
        /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
    const isAllowed = origin != null && (allowedOrigins.has(origin) || devLocalhost);
    if (isAllowed) {
        res.header("Access-Control-Allow-Origin", origin);
        res.header("Vary", "Origin");
        res.header("Access-Control-Allow-Credentials", "true");
        res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }
    next();
});
app.use("/api/users", user_route_1.default);
app.get("/", (req, res) => {
    res.send("Welcome to the User Management API");
});
const startServer = async () => {
    try {
        await (0, connection_1.connectDB)();
        app.listen(process.env.PORT, () => {
            console.log("ENV →", process.env.MONGODB_URI);
            console.log(`✓ Server running on port ${env_config_1.default.PORT}`);
        });
    }
    catch (error) {
        console.error("Error connecting to database:", error);
    }
};
startServer();
