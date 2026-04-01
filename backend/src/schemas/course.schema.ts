import mongoose, { Schema, Types } from "mongoose";

export interface ICourse {
  code:       string;
  name:       string;
  schedule:   string;
  department: string;
  instructor: Types.ObjectId;  // ref to User (faculty)
  students:   Types.ObjectId[];
  credits:    number;
  enrolled:   number;
  total:      number;
  status:     "Active" | "Inactive" | "Full";
  sourceDegree?: Types.ObjectId | null;
  sourceSectionKey?: string | null;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    code: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
    },
    name: {
      type:     String,
      required: true,
      trim:     true,
    },
    schedule: {
      type:     String,
      required: true,
    },
    department: {
      type:     String,
      required: true,
      trim:     true,
    },
    instructor: {
      type: Schema.Types.ObjectId,
      ref:  "User",   // references your User model (faculty)
    },
    students: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      default: [],
    },
    credits: {
      type:     Number,
      required: true,
    },
    enrolled: {
      type:    Number,
      default: 0,      // starts at 0 when course is created
    },
    total: {
      type:     Number,
      required: true,  // max seats
    },
    status: {
      type:    String,
      enum:    ["Active", "Inactive", "Full"],
      default: "Active",
    },
    sourceDegree: {
      type: Schema.Types.ObjectId,
      ref: "Degree",
      default: null,
    },
    sourceSectionKey: {
      type: String,
      default: null,
      trim: true,
    },
  },
  { timestamps: true }
);

export const CourseModel = mongoose.model<ICourse>("Course", courseSchema);
