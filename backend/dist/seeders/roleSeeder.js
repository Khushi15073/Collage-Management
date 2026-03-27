"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const role_schema_1 = require("../schemas/role.schema");
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("../db/connection");
dotenv_1.default.config();
const seedRoles = async () => {
    try {
        // await mongoose.connect();
        await (0, connection_1.connectDB)();
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
            await role_schema_1.RoleModel.findOneAndUpdate({ name: role.name }, // find by name
            { ...role }, // update data
            { upsert: true, returnDocument: 'after' } // create if not exists
            );
            console.log(`✅ Role created: ${role.name}`);
        }
        console.log("🎉 All roles seeded successfully");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Role seeding failed:", error);
        process.exit(1);
    }
};
seedRoles();
