import mongoose from "mongoose";
import { RoleModel } from "../schemas/role.schema";
import dotenv from "dotenv";
import { connectDB } from "../db/connection";
import { SYSTEM_ROLES } from "../constants/accessControl";

dotenv.config();

const seedRoles = async () => {
    try {
        // await mongoose.connect();
     await   connectDB()
        console.log("✅ DB Connected");

        for (const role of SYSTEM_ROLES) {
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
