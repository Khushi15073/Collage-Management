import mongoose, { Schema } from "mongoose";
import { IRole } from "../interfaces/role.interface";

const roleSchema = new mongoose.Schema<IRole>(
    {

        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            enum: {
                values: ["admin", "faculty", "student"],
                message: "{VALUE} is not a valid role"
            },
            
        }
        ,

        description: {
            type: String,
            trim: true
        },
        permissions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Permission"
            },

        ],


    },
    { timestamps: true }
);


export const RoleModel = mongoose.model<IRole>('Role', roleSchema)

