import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/Table";
import PaginationControls from "./ui/PaginationControls";
import { usePagination } from "../hooks/usePagination";
import StatsStrip from "./StatsStrip";
import { matchesSearchQuery } from "../utils/search";
import SearchField from "./ui/SearchField";

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
  const [searchQuery, setSearchQuery] = useState("");
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
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecentCourses = useMemo(() => {
    return (summary?.recentCourses || []).filter((course) =>
      matchesSearchQuery(
        [
          course.code,
          course.name,
          course.department,
          course.status,
          course.instructor?.name || "",
          course.enrolled,
          course.total,
          `${course.enrolled}/${course.total}`,
        ],
        normalizedQuery
      )
    );
  }, [normalizedQuery, summary?.recentCourses]);
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    paginatedItems: paginatedRecentCourses,
    canPreviousPage,
    canNextPage,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(filteredRecentCourses, 6);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-6">
      <div className="mb-4 shrink-0">
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}</p>
      </div>

      <div className="mb-5 max-w-md shrink-0">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search recent courses..."
        />
      </div>

      {error && (
        <div className="mb-6 shrink-0 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatsStrip
        items={[
          { title: "Total Students", value: String(summary?.counts.totalStudents ?? 0), loading },
          { title: "Total Faculty", value: String(summary?.counts.totalFaculty ?? 0), loading },
          { title: "Total Courses", value: String(summary?.counts.totalCourses ?? 0), loading },
          { title: "Available Seats", value: String(summary?.enrollment.availableSeats ?? 0), loading },
          { title: "Permissions", value: String(summary?.counts.totalPermissions ?? 0), loading },
        ]}
      />

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-4">
            <h2 className="text-base font-semibold text-gray-800">Recent Courses</h2>
            <p className="mt-1 text-sm text-gray-400">Latest courses from the backend</p>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <Table className="table-fixed">
              <TableHead>
                <TableRow className="border-b border-gray-100">
                  <TableHeader className="w-28">Code</TableHeader>
                  <TableHeader>Course</TableHeader>
                  <TableHeader className="w-48">Instructor</TableHeader>
                  <TableHeader className="w-32">Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-400">
                      Loading dashboard data...
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  paginatedRecentCourses.length > 0 &&
                  paginatedRecentCourses.map((course) => (
                    <TableRow key={course._id} className="border-b border-gray-50">
                      <TableCell className="font-semibold text-gray-800">{course.code}</TableCell>
                      <TableCell>
                        <div className="truncate font-medium text-gray-800">{course.name}</div>
                        <div className="truncate text-xs text-gray-400">{course.department}</div>
                      </TableCell>
                      <TableCell className="truncate text-gray-600">
                        {course.instructor?.name || "Unassigned"}
                      </TableCell>
                      <TableCell>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusBadge(course.status)}`}>
                          {course.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}

                {!loading && paginatedRecentCourses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-gray-400">
                      {normalizedQuery ? "No recent courses match your search." : "No courses available yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {!loading && filteredRecentCourses.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              itemLabel="courses"
              onPageChange={setPage}
              onPrevious={previousPage}
              onNext={nextPage}
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
            />
          )}
        </div>

        <div className="min-h-0 overflow-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
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
