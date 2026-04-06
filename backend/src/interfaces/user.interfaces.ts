import mongoose from "mongoose";
import { IRole } from "./role.interface";
export interface IUser {
    _id: mongoose.Types.ObjectId;           
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other";
    password: string;
    role: mongoose.Types.ObjectId | IRole;
    degree?: mongoose.Types.ObjectId | null;
    batch?: string | null;
    enrollmentYear?: number | null;
    enrollmentDate?: Date | null;
   
}

//  Create User (req.body)
export interface CreateUserDTO {
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other";
    password: string;
    role?: any;
    degree?: string;
    batch?: string;
    enrollmentYear?: number;
    enrollmentDate?: string;
}

//  Update User
export interface UpdateUserDTO {
    name?: string;
    email?: string;
    phoneNumber?: string;
    gender?: "male" | "female" | "other";
    password?: string;
    role?: string;
    degree?: string | null;
    batch?: string | null;
    enrollmentYear?: number | null;
    enrollmentDate?: string | null;
}

//  Login
export interface LoginDTO {
    email: string;
    password: string;
}
