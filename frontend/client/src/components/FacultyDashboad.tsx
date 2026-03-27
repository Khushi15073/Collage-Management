import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE_URL = "http://localhost:8000";

type FacultyCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
  schedule: string;
  status: "Active" | "Inactive" | "Full";
  enrolled: number;
  total: number;
};

type FacultyDashboardSummary = {
  counts: {
    totalCourses: number;
    totalStudents: number;
    activeCourses: number;
    fullCourses: number;
    availableSeats: number;
  };
  courses: FacultyCourse[];
};

const statCards = [
  { key: "totalCourses", icon: "📖", label: "My Courses", color: "bg-blue-500" },
  { key: "totalStudents", icon: "👥", label: "Total Students", color: "bg-emerald-500" },
  { key: "activeCourses", icon: "✅", label: "Active Courses", color: "bg-violet-500" },
  { key: "availableSeats", icon: "🪑", label: "Available Seats", color: "bg-orange-500" },
] as const;

function statusStyles(status: FacultyCourse["status"]) {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Full") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

function FacultyDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);

  const [summary, setSummary] = useState<FacultyDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/faculty`, {
          withCredentials: true,
        });

        if (active) {
          setSummary(response.data?.data || null);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch faculty dashboard");
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

  const courses = summary?.courses || [];

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.name || "Faculty"}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center text-xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium">{card.label}</p>
              <p className="text-2xl font-bold text-gray-800">
                {loading ? "..." : summary?.counts[card.key] ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800">My Classes</h2>
            <p className="text-sm text-gray-400 mt-1">Courses assigned from your backend data</p>
          </div>

          <div className="space-y-3">
            {loading && (
              <div className="rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
                Loading classes...
              </div>
            )}

            {!loading &&
              courses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-md">
                      {course.code}
                    </span>
                    <h3 className="text-sm font-bold text-gray-800">{course.name}</h3>
                    <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles(course.status)}`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-3">
                    <span>{course.department}</span>
                    <span>👥 {course.enrolled} students</span>
                    <span>🕐 {course.schedule}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate("/faculty/classes")}
                      className="px-4 py-1.5 text-xs font-semibold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => navigate("/faculty/attendance")}
                      className="px-4 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))}

            {!loading && courses.length === 0 && (
              <div className="rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
                No courses are assigned to you yet.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800">Course Snapshot</h2>
            
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Assigned courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.totalCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Active courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.activeCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Full courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.fullCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Total students</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.totalStudents ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
              <span className="text-sm text-gray-500">Available seats</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.availableSeats ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default FacultyDashboard;
