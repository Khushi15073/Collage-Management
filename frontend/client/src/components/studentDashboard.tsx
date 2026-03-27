import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { BookOpen, Calendar, CheckCircle, XCircle } from "lucide-react";

const BASE_URL = "http://localhost:8000";

type StudentDashboardSummary = {
  counts: {
    enrolledCourses: number;
    totalCredits: number;
    overallAttendance: number;
    classesAttended: number;
    classesMissed: number;
  };
  enrolledCourses: {
    _id: string;
    code: string;
    name: string;
    department: string;
    schedule: string;
    credits: number;
    status: string;
    instructorName: string;
  }[];
  courseAttendance: {
    code: string;
    name: string;
    present: number;
    total: number;
    percentage: number;
  }[];
  recentAttendance: {
    _id: string;
    date: string;
    courseCode: string;
    courseName: string;
    status: "present" | "absent";
  }[];
};

const statCardConfig = [
  {
    key: "enrolledCourses",
    label: "Enrolled Courses",
    icon: BookOpen,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "overallAttendance",
    label: "Attendance",
    icon: Calendar,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    suffix: "%",
  },
  {
    key: "classesAttended",
    label: "Classes Attended",
    icon: CheckCircle,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  {
    key: "classesMissed",
    label: "Classes Missed",
    icon: XCircle,
    bg: "bg-red-100",
    iconColor: "text-red-500",
  },
] as const;

function getCardValue(
  summary: StudentDashboardSummary | null,
  key: "enrolledCourses" | "overallAttendance" | "classesAttended" | "classesMissed"
) {
  return summary?.counts[key] ?? 0;
}

function StudentDashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/student`, {
          withCredentials: true,
        });

        if (active) {
          setSummary(response.data?.data || null);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch student dashboard");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-400">Welcome back, {user?.name || "Student"}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCardConfig.map((card) => (
          <div
            key={card.key}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg}`}>
              <card.icon className={`h-6 w-6 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading
                  ? "..."
                  : `${getCardValue(summary, card.key)}${"suffix" in card ? card.suffix : ""}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Course-wise Attendance</h2>
            <span className="text-xs text-gray-400">
              Credits: {loading ? "..." : summary?.counts.totalCredits ?? 0}
            </span>
          </div>

          <div className="space-y-4">
            {loading && <div className="text-sm text-gray-400">Loading attendance...</div>}

            {!loading && (summary?.courseAttendance.length || 0) === 0 && (
              <div className="text-sm text-gray-400">No attendance records found yet.</div>
            )}

            {!loading &&
              summary?.courseAttendance.map((course) => (
                <div key={course.code} className="rounded-xl border border-gray-100 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                        {course.code}
                      </span>
                      <span className="text-sm font-bold text-gray-800">{course.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {course.percentage}%
                    </span>
                  </div>
                  <p className="mb-2 text-xs text-gray-400">
                    {course.present} / {course.total} classes attended
                  </p>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${
                        course.percentage >= 90
                          ? "bg-green-500"
                          : course.percentage >= 80
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${course.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-gray-800">Enrolled Courses</h2>

          <div className="space-y-3">
            {loading && <div className="text-sm text-gray-400">Loading courses...</div>}

            {!loading && (summary?.enrolledCourses.length || 0) === 0 && (
              <div className="text-sm text-gray-400">You are not enrolled in any course yet.</div>
            )}

            {!loading &&
              summary?.enrolledCourses.map((course) => (
                <div key={course._id} className="rounded-xl border border-gray-100 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                      {course.code}
                    </span>
                    <span className="text-sm font-bold text-gray-800">{course.name}</span>
                    <span className="ml-auto rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                      {course.status}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>{course.department}</div>
                    <div>{course.instructorName}</div>
                    <div>{course.schedule}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800">Recent Attendance</h2>

        {loading && <div className="text-sm text-gray-400">Loading recent attendance...</div>}

        {!loading && (summary?.recentAttendance.length || 0) === 0 && (
          <div className="text-sm text-gray-400">No attendance activity found yet.</div>
        )}

        {!loading && (summary?.recentAttendance.length || 0) > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-3 text-left text-xs font-semibold uppercase text-gray-500">Date</th>
                  <th className="py-3 text-left text-xs font-semibold uppercase text-gray-500">Course</th>
                  <th className="py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {summary?.recentAttendance.map((record) => (
                  <tr key={record._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="py-3 text-xs text-gray-600">{record.date}</td>
                    <td className="py-3">
                      <div className="font-medium text-gray-800">{record.courseName}</div>
                      <div className="text-xs text-gray-400">{record.courseCode}</div>
                    </td>
                    <td className="py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          record.status === "present"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status === "present" ? "Present" : "Absent"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDashboard;
