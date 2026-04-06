import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PaginationControls from "./ui/PaginationControls";
import { usePagination } from "../hooks/usePagination";
import StatsStrip from "./StatsStrip";
import SearchField from "./ui/SearchField";

const BASE_URL = "http://localhost:8000";

type FacultyCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
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
  { key: "totalCourses", label: "My Courses" },
  { key: "totalStudents", label: "Total Students" },
  { key: "activeCourses", label: "Active Courses" },
  { key: "availableSeats", label: "Available Seats" },
] as const;

function statusStyles(status: FacultyCourse["status"]) {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Full") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

function FacultyDashboard() {
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth.user);
  const [searchQuery, setSearchQuery] = useState("");

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const courses = useMemo(() => {
    const allCourses = summary?.courses || [];

    if (!normalizedQuery) {
      return allCourses;
    }

    return allCourses.filter((course) =>
      [
        course.code,
        course.name,
        course.department,
        course.status,
        String(course.enrolled),
        String(course.total),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [normalizedQuery, summary?.courses]);
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    paginatedItems: paginatedCourses,
    canPreviousPage,
    canNextPage,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(courses, 6);

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-gray-50 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faculty Dashboard</h1>
        <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.name || "Faculty"}</p>
      </div>

      <div className="mt-5 max-w-md">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search classes..."
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatsStrip
        items={statCards.map((card) => ({
          title: card.label,
          value: String(summary?.counts[card.key] ?? 0),
          loading,
        }))}
      />

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 flex min-h-0 flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-800">My Classes</h2>
            <p className="text-sm text-gray-400 mt-1">Courses assigned from your backend data</p>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-auto">
            {loading && (
              <div className="rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
                Loading classes...
              </div>
            )}

            {!loading &&
              paginatedCourses.map((course) => (
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
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span>{course.department}</span>
                    <span>{course.enrolled} students</span>
                  </div>
                  <div className="flex">
                    <button
                      onClick={() => navigate("/faculty/attendance")}
                      className="px-4 py-1.5 text-xs font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))}

            {!loading && paginatedCourses.length === 0 && (
              <div className="rounded-xl border border-gray-100 p-4 text-sm text-gray-400">
                {normalizedQuery ? "No classes match your search." : "No courses are assigned to you yet."}
              </div>
            )}
          </div>

          {!loading && courses.length > 0 && (
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalItems={totalItems}
              itemLabel="classes"
              onPageChange={setPage}
              onPrevious={previousPage}
              onNext={nextPage}
              canPreviousPage={canPreviousPage}
              canNextPage={canNextPage}
              className="mt-4 px-0"
            />
          )}
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
