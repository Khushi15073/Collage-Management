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
            return await user.populate(["role", "degree"]);
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
    async findRoleIdByName(roleName) {
        const role = await role_schema_1.RoleModel.findOne({ name: roleName });
        if (!role) {
            throw errorClass_1.AppError.notFound("Role not found");
        }
        return role._id;
    }
    async findAllUsers(options) {
        var _a, _b, _c;
        try {
            const filter = {};
            if (options === null || options === void 0 ? void 0 : options.roleId) {
                filter.role = options.roleId;
            }
            const normalizedSearch = (_a = options === null || options === void 0 ? void 0 : options.search) === null || _a === void 0 ? void 0 : _a.trim();
            if (normalizedSearch) {
                filter.$or = [
                    { name: { $regex: normalizedSearch, $options: "i" } },
                    { email: { $regex: normalizedSearch, $options: "i" } },
                    { phoneNumber: { $regex: normalizedSearch, $options: "i" } },
                    { gender: { $regex: normalizedSearch, $options: "i" } },
                ];
            }
            const skip = (_b = options === null || options === void 0 ? void 0 : options.skip) !== null && _b !== void 0 ? _b : 0;
            const limit = (_c = options === null || options === void 0 ? void 0 : options.limit) !== null && _c !== void 0 ? _c : 10;
            const [users, totalItems] = await Promise.all([
                user_schema_1.default.find(filter)
                    .sort({ createdAt: -1, _id: -1 })
                    .skip(skip)
                    .limit(limit)
                    .populate("role")
                    .populate("degree", "degreeName department type count"),
                user_schema_1.default.countDocuments(filter),
            ]);
            return { users, totalItems };
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
            const user = await user_schema_1.default.findById(userId)
                .populate("role")
                .populate("degree", "degreeName department type count");
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
            })
                .populate("role")
                .populate("degree", "degreeName department type count");
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
            const user = await user_schema_1.default.findByIdAndDelete(userId)
                .populate("role")
                .populate("degree", "degreeName department type count");
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
