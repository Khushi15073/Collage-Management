"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.DatabaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_config_1 = __importDefault(require("../config/env.config"));
class DatabaseConnection {
    constructor() { }
    static get() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        try {
            await mongoose_1.default.connect(env_config_1.default.MONGODB_URI);
            console.log("Connected to MongoDB");
        }
        catch (error) {
            console.error("Error connecting to MongoDB:", error);
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
const connectDB = async () => {
    await DatabaseConnection.get().connect();
};
exports.connectDB = connectDB;
exports.default = DatabaseConnection;
