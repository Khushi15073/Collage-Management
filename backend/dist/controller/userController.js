"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
class UserController {
    constructor() {
        this.userService = new user_service_1.UserService();
    }
    async login(req, res) {
        var _a;
        try {
            const { email, password } = req.body;
            const result = await this.userService.login(email, password);
            res.cookie("token", result.token, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 3600000,
            });
            res.cookie("refreshToken", result.refreshToken, {
                httpOnly: true,
                sameSite: "strict",
                maxAge: 7 * 24 * 3600000,
            });
            res.status(200).json(result);
        }
        catch (error) {
            res
                .status(401)
                .json({ message: "Login failed", error: (_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : error });
        }
    }
    async logout(req, res) {
        res.clearCookie("token");
        res.clearCookie("refreshToken");
        res.status(200).json({ message: "Logout successful" });
    }
    async createUser(req, res) {
        try {
            const userData = req.body;
            const newUser = await this.userService.createUser(userData);
            res.status(201).json({
                message: "User created successfully",
                user: newUser,
            });
        }
        catch (error) {
            console.error("Create User Error:", error);
            res.status(500).json({
                message: "Error creating user",
                error: error.message,
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const users = await this.userService.getAllUsers();
            res.status(200).json(users);
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching users", error });
        }
    }
    async getUser(req, res) {
        try {
            const userId = req.params.id;
            const user = await this.userService.getUserById(userId);
            if (user) {
                res.status(200).json(user);
            }
            else {
                res.status(404).json({ message: "User not found" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Error fetching user", error });
        }
    }
    async updateUser(req, res) {
        try {
            const userId = req.params.id;
            const updateData = req.body;
            const updatedUser = await this.userService.updateUser(userId, updateData);
            if (updatedUser) {
                res.status(200).json({
                    message: "User updated successfully",
                    user: updatedUser,
                });
            }
            else {
                res.status(404).json({ message: "User not found" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Error updating user", error });
        }
    }
    async deleteUser(req, res) {
        try {
            const userId = req.params.id;
            const deleted = await this.userService.deleteUser(userId);
            if (deleted) {
                res.status(200).json({ message: "User deleted successfully" });
            }
            else {
                res.status(404).json({ message: "User not found" });
            }
        }
        catch (error) {
            res.status(500).json({ message: "Error deleting user", error });
        }
    }
}
exports.UserController = UserController;
