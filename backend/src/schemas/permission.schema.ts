import mongoose, { Schema } from "mongoose";
import { IPermission } from "../interfaces/permission.interface";


const permissionSchema = new Schema<IPermission>(

    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, "Please Provide Valid Name"],
        },

        description: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
)

export const PermissionModel = mongoose.model<IPermission>('Permission', permissionSchema)