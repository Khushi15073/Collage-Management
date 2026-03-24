"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const user_model_1 = __importDefault(require("../modals/user.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserFactory {
    async login(email, password) {
        const user = await user_model_1.default.findOne({ email });
        const isPasswordValid = await bcrypt_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || "");
        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }
        if (!user) {
            throw new Error("Invalid email or password");
        }
        return { message: "Login successful", user };
    }
    async createUser(userData) {
        const user = new user_model_1.default(userData);
        await user.save();
        return user;
    }
    async findAllUsers() {
        const users = await user_model_1.default.find();
        return users;
    }
    async findUserByEmail(email) {
        const user = await user_model_1.default.findOne({ email });
        return user;
    }
    async findUserById(userId) {
        const user = await user_model_1.default.findById(userId);
        return user;
    }
    async updateUser(userId, updateData) {
        const user = await user_model_1.default.findByIdAndUpdate(userId, updateData, {
            new: true,
        });
        return user;
    }
    async deleteUser(userId) {
        await user_model_1.default.findByIdAndDelete(userId);
    }
}
exports.UserFactory = UserFactory;
