
import mongoose from "mongoose";

/* DB Interface (used in schema) */

export interface IRole {
    _id: mongoose.Types.ObjectId;
    name: string;
    description?: string;                   
    permissions?: mongoose.Types.ObjectId[]; 
    createdAt?: Date;
    updatedAt?: Date;
}



// create role
export interface CreateRoleDTO {
    name: string;
    description?: string;
    permissions: string[];
}

// update role
export interface UpdateRoleDTO {
    name?: string;
    description?: string;
    permissions?: string[];
}

// params
export interface IdParam {
    id: string;
}
