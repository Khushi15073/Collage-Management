import mongoose from "mongoose";
import bcrypt from "bcrypt";
// import { UserModel } from "../models/user.schema";
import UserModel from  "../schemas/user.schema"
import { RoleModel } from "../schemas/role.schema";
import dotenv from "dotenv";
import { connectDB } from "../db/connection";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB()
        console.log("✅ DB Connected");

        // ✅ Step 1 — get admin role
        const adminRole = await RoleModel.findOne({ name: "admin" });
        if (!adminRole) {
            console.error("❌ Admin role not found — run roleSeeder first");
            process.exit(1);
        }

        // ✅ Step 2 — check if admin already exists
        const existingAdmin = await UserModel.findOne({
            email: process.env.ADMIN_EMAIL,
        });

        if (existingAdmin) {
            console.log("⚠️  Admin already exists — skipping");
            process.exit(0);
        }

        // ✅ Step 3 — hash password
        const hashedPassword = await bcrypt.hash(
            process.env.ADMIN_PASSWORD!,
            10
        );

        // ✅ Step 4 — create admin
        const admin = await UserModel.create({
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

    } catch (error) {
        console.error("❌ Admin seeding failed:", error);
        process.exit(1);
    }
};

seedAdmin();