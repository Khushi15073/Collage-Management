export interface SaveAttendanceRecordDTO {
  studentId: string;
  status: "present" | "absent";
}

export interface SaveAttendanceDTO {
  courseId: string;
  date: string;
  records: SaveAttendanceRecordDTO[];
}
