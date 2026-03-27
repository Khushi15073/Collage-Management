"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const routes_1 = __importDefault(require("./routes"));
const env_config_1 = require("./config/env.config");
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const connection_1 = require("./db/connection");
const notFound_middleware_1 = require("./middleware/notFound.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use("/api", routes_1.default);
app.get("/", (req, res) => {
    res.send("Welcome");
});
app.use(notFound_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
const startServer = async () => {
    try {
        await (0, connection_1.connectDB)();
        app.listen(env_config_1.config.PORT, () => {
            console.log(`Server running on port ${env_config_1.config.PORT}`);
        });
    }
    catch (error) {
        console.error("Error connecting to database:", error);
    }
};
startServer();
