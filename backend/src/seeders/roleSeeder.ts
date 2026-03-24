import mongoose from "mongoose";
import { RoleModel } from "../schemas/role.schema";
import dotenv from "dotenv";
import { connectDB } from "../db/connection";

dotenv.config();

const seedRoles = async () => {
    try {
        // await mongoose.connect();
     await   connectDB()
        console.log("✅ DB Connected");

        const roles = [
            {
                name: "admin",
                description: "Full access to all features",
            },
            {
                name: "faculty",
                description: "Access to manage students and courses",
            },
            {
                name: "student",
                description: "Access to view courses and results",
            },
        ];

        for (const role of roles) {
            await RoleModel.findOneAndUpdate(
                { name: role.name },        // find by name
                { ...role },                // update data
                { upsert: true, returnDocument: 'after'  } // create if not exists
            );
            console.log(`✅ Role created: ${role.name}`);
        }

        console.log("🎉 All roles seeded successfully");
        process.exit(0);

    } catch (error) {
        console.error("❌ Role seeding failed:", error);
        process.exit(1);
    }
};

seedRoles();