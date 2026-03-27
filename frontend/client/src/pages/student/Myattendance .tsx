import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, XCircle, Calendar } from "lucide-react";

const BASE_URL = "http://localhost:8000";

type StudentAttendanceSummary = {
  counts: {
    overallAttendance: number;
    classesAttended: number;
    classesMissed: number;
  };
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

const attendanceStats = [
  {
    key: "overallAttendance",
    label: "Overall Attendance",
    icon: CheckCircle,
    bg: "bg-green-100",
    iconColor: "text-green-600",
    suffix: "%",
  },
  {
    key: "classesAttended",
    label: "Classes Attended",
    icon: Calendar,
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    key: "classesMissed",
    label: "Classes Missed",
    icon: XCircle,
    bg: "bg-red-100",
    iconColor: "text-red-500",
  },
] as const;

function attendanceColor(pct: number) {
  if (pct >= 90) return { bar: "bg-green-500", badge: "bg-green-100 text-green-700" };
  if (pct >= 80) return { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
  return { bar: "bg-red-500", badge: "bg-red-100 text-red-600" };
}

function MyAttendance() {
  const [activeTab, setActiveTab] = useState<"course" | "recent">("course");
  const [summary, setSummary] = useState<StudentAttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAttendance() {
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
          setError(requestError.response?.data?.message || "Failed to fetch attendance");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAttendance();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track your attendance across all courses</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {attendanceStats.map((stat) => (
          <div key={stat.key} className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {loading ? "..." : `${summary?.counts[stat.key] ?? 0}${"suffix" in stat ? stat.suffix : ""}`}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("course")}
            className={`flex-1 py-3.5 text-sm font-semibold transition ${
              activeTab === "course"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Course-wise Attendance
          </button>
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex-1 py-3.5 text-sm font-semibold transition ${
              activeTab === "recent"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Recent Attendance
          </button>
        </div>

        <div className="p-6">
          {activeTab === "course" && (
            <div className="space-y-4">
              {loading && <div className="text-sm text-gray-400">Loading attendance...</div>}

              {!loading && (summary?.courseAttendance.length || 0) === 0 && (
                <div className="text-sm text-gray-400">No attendance records found yet.</div>
              )}

              {!loading && summary?.courseAttendance.map((course) => {
                const colors = attendanceColor(course.percentage);

                return (
                  <div key={course.code} className="p-4 border border-gray-100 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded">
                          {course.code}
                        </span>
                        <span className="text-sm font-bold text-gray-800">{course.name}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors.badge}`}>
                        {course.percentage}%
                      </span>
                    </div>

                    <p className="text-xs text-gray-400 mb-2">
                      {course.present} / {course.total} classes attended
                    </p>

                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-2 rounded-full ${colors.bar} transition-all`}
                        style={{ width: `${course.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "recent" && (
            <>
              {loading && <div className="text-sm text-gray-400">Loading recent attendance...</div>}

              {!loading && (summary?.recentAttendance.length || 0) === 0 && (
                <div className="text-sm text-gray-400">No recent attendance found yet.</div>
              )}

              {!loading && (summary?.recentAttendance.length || 0) > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                        <th className="text-left py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary?.recentAttendance.map((record) => (
                        <tr key={record._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="py-3 text-gray-600 text-xs">{record.date}</td>
                          <td className="py-3">
                            <div className="font-medium text-gray-800">{record.courseName}</div>
                            <div className="text-xs text-gray-400">{record.courseCode}</div>
                          </td>
                          <td className="py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAttendance;
