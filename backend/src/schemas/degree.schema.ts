import mongoose, { Schema } from "mongoose";
import type { IDegree } from "../interfaces/degree.interface";

const degreeCourseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
  },
  { _id: false }
);

const degreeSectionSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    courses: {
      type: [degreeCourseSchema],
      default: [],
    },
  },
  { _id: false }
);

const degreeSchema = new Schema<IDegree>(
  {
    degreeName: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["semester", "year"],
      required: true,
    },
    count: {
      type: Number,
      required: true,
      min: 1,
    },
    sections: {
      type: [degreeSectionSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const DegreeModel = mongoose.model<IDegree>("Degree", degreeSchema);
