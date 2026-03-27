import mongoose, { Schema, Types } from "mongoose";

export interface IAttendance {
  course: Types.ObjectId;
  faculty: Types.ObjectId;
  student: Types.ObjectId;
  date: string;
  status: "present" | "absent";
}

const attendanceSchema = new mongoose.Schema<IAttendance>(
  {
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    faculty: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ course: 1, student: 1, date: 1 }, { unique: true });

export const AttendanceModel = mongoose.model<IAttendance>("Attendance", attendanceSchema);
