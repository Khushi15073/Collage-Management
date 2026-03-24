import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user.interfaces";


const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      match: [/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, "Please Provide Valid Name"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"]
    },
    phoneNumber: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please provide a valid 10-digit phone number"],
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
        minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true
    }
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IUser>("User", userSchema);
