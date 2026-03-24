"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_factory_1 = require("../factory/user.factory");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserService {
    constructor() {
        this.userFactory = new user_factory_1.UserFactory();
    }
    async login(email, password) {
        const user = await this.userFactory.findUserByEmail(email);
        if (!user) {
            throw new Error("Invalid email or password");
        }
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || "defaultsecret", { expiresIn: "1h" });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET || "defaultrefreshsecret", { expiresIn: "7d" });
        return { message: "Login successful", user, token, refreshToken, };
    }
    async createUser(userData) {
        if (!userData.email || !userData.password || !userData.name) {
            throw new Error("Missing required fields");
        }
        const existingUser = await this.userFactory.findUserByEmail(userData.email);
        if (existingUser) {
            throw new Error("Email already in use");
        }
        const hashedPassword = await bcrypt_1.default.hash(userData.password, 10);
        userData.password = hashedPassword;
        const user = await this.userFactory.createUser(userData);
        return user;
    }
    async getAllUsers() {
        const users = await this.userFactory.findAllUsers();
        return users;
    }
    async getUserById(userId) {
        const user = await this.userFactory.findUserById(userId);
        return user;
    }
    async updateUser(userId, updateData) {
        const user = await this.userFactory.findUserById(userId);
        if (!user) {
            return null;
        }
        const updatedUser = await this.userFactory.updateUser(userId, updateData);
        return updatedUser;
    }
    async deleteUser(userId) {
        const user = await this.userFactory.findUserById(userId);
        if (!user) {
            return false;
        }
        await this.userFactory.deleteUser(userId);
        return true;
    }
}
exports.UserService = UserService;
