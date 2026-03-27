"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const user_schema_1 = __importDefault(require("../schemas/user.schema"));
const errorClass_1 = require("../utility/errorClass");
const role_schema_1 = require("../schemas/role.schema");
class UserFactory {
    async createUser(userData) {
        try {
            const user = new user_schema_1.default(userData);
            await user.save();
            return await user.populate("role");
        }
        catch (error) {
            throw error;
        }
    }
    async getDefaultRole() {
        try {
            const role = await role_schema_1.RoleModel.findOne({ name: "student" });
            if (!role) {
                throw errorClass_1.AppError.notFound("Default role not found — run roleSeeder first");
            }
            return role;
        }
        catch (error) {
            throw error;
        }
    }
    async getRoleNameById(roleId) {
        const role = await role_schema_1.RoleModel.findById(roleId).select("name");
        if (!role) {
            throw errorClass_1.AppError.notFound("Role not found");
        }
        return role.name;
    }
    async findAllUsers(roleName) {
        try {
            let filter = {};
            if (roleName) {
                const role = await role_schema_1.RoleModel.findOne({ name: roleName });
                if (!role) {
                    throw errorClass_1.AppError.notFound("Role not found");
                }
                filter = { role: role._id };
            }
            const users = await user_schema_1.default.find(filter).populate("role");
            if (users.length === 0) {
                throw errorClass_1.AppError.notFound("No users found");
            }
            return users;
        }
        catch (error) {
            throw error;
        }
    }
    async findUserByEmail(email) {
        try {
            const user = await user_schema_1.default.findOne({ email });
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async findUserById(userId) {
        try {
            const user = await user_schema_1.default.findById(userId).populate("role");
            if (!user) {
                throw errorClass_1.AppError.notFound("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async updateUser(userId, updateData) {
        try {
            const user = await user_schema_1.default.findByIdAndUpdate(userId, updateData, {
                new: true,
            }).populate("role");
            if (!user) {
                throw errorClass_1.AppError.notFound("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteUser(userId) {
        try {
            const user = await user_schema_1.default.findByIdAndDelete(userId).populate("role");
            if (!user) {
                throw errorClass_1.AppError.notFound("User not found");
            }
            return user;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.UserFactory = UserFactory;
