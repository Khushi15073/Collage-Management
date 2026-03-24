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
   
}

//  Create User (req.body)
export interface CreateUserDTO {
    name: string;
    email: string;
    phoneNumber: string;
    gender: "male" | "female" | "other";
    password: string;
   
    role?: any; 
}

//  Update User
export interface UpdateUserDTO {
    name?: string;
    email?: string;
    phoneNumber?: string;
    gender?: "male" | "female" | "other";
    password?: string;
    role?: string;
}

//  Login
export interface LoginDTO {
    email: string;
    password: string;
}