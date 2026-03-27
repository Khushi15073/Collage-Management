"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
// import { UserModel } from "../models/user.schema";
const user_schema_1 = __importDefault(require("../schemas/user.schema"));
const role_schema_1 = require("../schemas/role.schema");
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("../db/connection");
dotenv_1.default.config();
const seedAdmin = async () => {
    try {
        await (0, connection_1.connectDB)();
        console.log("✅ DB Connected");
        // ✅ Step 1 — get admin role
        const adminRole = await role_schema_1.RoleModel.findOne({ name: "admin" });
        if (!adminRole) {
            console.error("❌ Admin role not found — run roleSeeder first");
            process.exit(1);
        }
        // ✅ Step 2 — check if admin already exists
        const existingAdmin = await user_schema_1.default.findOne({
            email: process.env.ADMIN_EMAIL,
        });
        if (existingAdmin) {
            console.log("⚠️  Admin already exists — skipping");
            process.exit(0);
        }
        // ✅ Step 3 — hash password
        const hashedPassword = await bcrypt_1.default.hash(process.env.ADMIN_PASSWORD, 10);
        // ✅ Step 4 — create admin
        const admin = await user_schema_1.default.create({
            name: process.env.ADMIN_NAME,
            email: process.env.ADMIN_EMAIL,
            phoneNumber: process.env.ADMIN_PHONE,
            gender: process.env.ADMIN_GENDER,
            password: hashedPassword,
            role: adminRole._id,
        });
        console.log("🎉 Admin created successfully");
        console.log(`📧 Email    : ${admin.email}`);
        console.log(`🔑 Password : ${process.env.ADMIN_PASSWORD}`);
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Admin seeding failed:", error);
        process.exit(1);
    }
};
seedAdmin();
