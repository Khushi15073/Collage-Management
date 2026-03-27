import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Calendar } from "lucide-react";

const BASE_URL = "http://localhost:8000";

type AttendanceCourse = {
  _id: string;
  code: string;
  name: string;
  studentCount: number;
};

type AttendanceStudent = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  status: "present" | "absent";
};

function MarkAttendance() {
  const today = new Date().toISOString().split("T")[0];

  const [courses, setCourses] = useState<AttendanceCourse[]>([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoadingCourses(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/attendance/faculty/courses`, {
          withCredentials: true,
        });

        if (!active) {
          return;
        }

        const courseList = response.data?.data || [];
        setCourses(courseList);

        if (courseList.length > 0) {
          setCourseId((current) => current || courseList[0]._id);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch courses");
        }
      } finally {
        if (active) {
          setLoadingCourses(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSheet() {
      if (!courseId) {
        setStudents([]);
        return;
      }

      try {
        setLoadingSheet(true);
        setError(null);
        setSuccess(null);

        const response = await axios.get(`${BASE_URL}/api/attendance/faculty/sheet`, {
          params: { courseId, date },
          withCredentials: true,
        });

        if (active) {
          setStudents(response.data?.data?.students || []);
        }
      } catch (requestError: any) {
        if (active) {
          setStudents([]);
          setError(requestError.response?.data?.message || "Failed to fetch attendance sheet");
        }
      } finally {
        if (active) {
          setLoadingSheet(false);
        }
      }
    }

    loadSheet();

    return () => {
      active = false;
    };
  }, [courseId, date]);

  const present = students.filter((student) => student.status === "present").length;
  const absent = students.length - present;
  const percentage =
    students.length > 0 ? ((present / students.length) * 100).toFixed(1) : "0.0";

  function updateStudentStatus(studentId: string, status: "present" | "absent") {
    setStudents((current) =>
      current.map((student) =>
        student._id === studentId ? { ...student, status } : student
      )
    );
  }

  function markAll(status: "present" | "absent") {
    setStudents((current) => current.map((student) => ({ ...student, status })));
  }

  async function handleSubmit() {
    if (!courseId) {
      setError("Please select a course first.");
      return;
    }

    if (students.length === 0) {
      setError("No students are assigned to this course.");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      await axios.post(
        `${BASE_URL}/api/attendance/faculty`,
        {
          courseId,
          date,
          records: students.map((student) => ({
            studentId: student._id,
            status: student.status,
          })),
        },
        {
          withCredentials: true,
        }
      );

      setSuccess("Attendance saved successfully.");
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="mt-1 text-gray-400">Record student attendance for your classes</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving || loadingSheet || !courseId}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {saving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      {(error || success) && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm ${
            error
              ? "border border-red-100 bg-red-50 text-red-700"
              : "border border-green-100 bg-green-50 text-green-700"
          }`}
        >
          {error || success}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Present</p>
            <p className="text-3xl font-bold text-gray-900">{present}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100">
            <XCircle className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Absent</p>
            <p className="text-3xl font-bold text-gray-900">{absent}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Attendance %</p>
            <p className="text-3xl font-bold text-gray-900">{percentage}%</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="mb-4 text-base font-semibold text-gray-800">Attendance Sheet</h2>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Select Course
              </label>
              <select
                value={courseId}
                onChange={(event) => setCourseId(event.target.value)}
                disabled={loadingCourses}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-500">
                Quick Actions
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => markAll("present")}
                  disabled={students.length === 0}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => markAll("absent")}
                  disabled={students.length === 0}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Mark All Absent
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">
                  Present
                </th>
              </tr>
            </thead>
            <tbody>
              {(loadingCourses || loadingSheet) && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400">
                    Loading attendance sheet...
                  </td>
                </tr>
              )}

              {!loadingCourses && !loadingSheet && students.map((student) => {
                const isPresent = student.status === "present";

                return (
                  <tr
                    key={student._id}
                    className={`border-b border-gray-50 transition ${
                      isPresent ? "bg-green-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-400">{student._id}</div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <div>{student.email}</div>
                      <div>{student.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isPresent}
                        onChange={() =>
                          updateStudentStatus(
                            student._id,
                            isPresent ? "absent" : "present"
                          )
                        }
                        className="h-4 w-4 cursor-pointer accent-blue-600"
                      />
                    </td>
                  </tr>
                );
              })}

              {!loadingCourses && !loadingSheet && students.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm text-gray-400">
                    {courseId
                      ? "No students are assigned to this course."
                      : "Select a course to start marking attendance."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          {present} of {students.length} students marked present
        </div>
      </div>
    </div>
  );
}

export default MarkAttendance;
