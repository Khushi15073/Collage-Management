import { useEffect, useState } from "react";
import axios from "axios";
import { Users, UsersRound, BookOpen, ShieldCheck, Armchair } from "lucide-react";
import { useSelector } from "react-redux";
import StatCard from "./StatCard";

const BASE_URL = "http://localhost:8000";

type RecentCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
  status: "Active" | "Inactive" | "Full";
  enrolled: number;
  total: number;
  instructor?: {
    _id: string;
    name: string;
    email?: string;
  } | null;
};

type DashboardSummary = {
  counts: {
    totalStudents: number;
    totalFaculty: number;
    totalAdmins: number;
    totalCourses: number;
    activeCourses: number;
    fullCourses: number;
    inactiveCourses: number;
    totalPermissions: number;
    totalRoles: number;
  };
  enrollment: {
    totalEnrolled: number;
    totalCapacity: number;
    availableSeats: number;
  };
  recentCourses: RecentCourse[];
};

function getStatusBadge(status: RecentCourse["status"]) {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Full") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

export default function Dashboard() {
  const user = useSelector((state: any) => state.auth.user);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
          withCredentials: true,
        });

        if (active) {
          setSummary(response.data?.data || null);
        }
      } catch (requestError: any) {
        if (active) {
          setError(requestError.response?.data?.message || "Failed to fetch dashboard");
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

  const displayName = user?.name || "Admin";

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Students"
          value={loading ? "..." : String(summary?.counts.totalStudents ?? 0)}
          icon={Users}
          iconBgColor="bg-blue-600"
        />
        <StatCard
          title="Total Faculty"
          value={loading ? "..." : String(summary?.counts.totalFaculty ?? 0)}
          icon={UsersRound}
          iconBgColor="bg-green-500"
        />
        <StatCard
          title="Total Courses"
          value={loading ? "..." : String(summary?.counts.totalCourses ?? 0)}
          icon={BookOpen}
          iconBgColor="bg-indigo-600"
        />
        <StatCard
          title="Available Seats"
          value={loading ? "..." : String(summary?.enrollment.availableSeats ?? 0)}
          icon={Armchair}
          iconBgColor="bg-orange-500"
        />
        <StatCard
          title="Permissions"
          value={loading ? "..." : String(summary?.counts.totalPermissions ?? 0)}
          icon={ShieldCheck}
          iconBgColor="bg-slate-700"
        />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Recent Courses</h2>
            <p className="mt-1 text-sm text-gray-400">Latest courses from the backend</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Instructor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                      Loading dashboard data...
                    </td>
                  </tr>
                )}

                {!loading &&
                  (summary?.recentCourses.length ?? 0) > 0 &&
                  summary?.recentCourses.map((course) => (
                    <tr key={course._id} className="border-b border-gray-50">
                      <td className="px-6 py-4 font-semibold text-gray-800">{course.code}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-800">{course.name}</div>
                        <div className="text-xs text-gray-400">{course.department}</div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{course.instructor?.name || "Unassigned"}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                {!loading && (summary?.recentCourses.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-gray-400">
                      No courses available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">System Snapshot</h2>
            <p className="mt-1 text-sm text-gray-400">Current totals from your backend</p>
          </div>

          <div className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Active courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.activeCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Full courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.fullCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Inactive courses</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.inactiveCourses ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Admins</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.totalAdmins ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Roles</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.counts.totalRoles ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total enrolled</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.enrollment.totalEnrolled ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total seat capacity</span>
              <span className="text-sm font-semibold text-gray-900">{loading ? "..." : summary?.enrollment.totalCapacity ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
