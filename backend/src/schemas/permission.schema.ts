import mongoose, { Schema } from "mongoose";
import { IPermission } from "../interfaces/permission.interface";


const permissionSchema = new Schema<IPermission>(

    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            match: [/^[a-z]+(?:_[a-z]+)*$/, "Please provide a valid permission key"],
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
