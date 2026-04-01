import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import PaginationControls from "../../components/ui/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import { useDashboardSearch } from "../../context/DashboardSearchContext";
import { matchesSearchQuery } from "../../utils/search";

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

function attendanceColor(pct: number) {
  if (pct >= 90) return { bar: "bg-green-500", badge: "bg-green-100 text-green-700" };
  if (pct >= 80) return { bar: "bg-yellow-500", badge: "bg-yellow-100 text-yellow-700" };
  return { bar: "bg-red-500", badge: "bg-red-100 text-red-600" };
}

function MyAttendance() {
  const { searchQuery } = useDashboardSearch();
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

  const courseAttendance = summary?.courseAttendance || [];
  const recentAttendance = summary?.recentAttendance || [];
  const filteredCourseAttendance = useMemo(
    () =>
      courseAttendance.filter((course) =>
        matchesSearchQuery(
          [course.code, course.name, course.present, course.total, course.percentage, `${course.percentage}%`],
          searchQuery
        )
      ),
    [courseAttendance, searchQuery]
  );
  const filteredRecentAttendance = useMemo(
    () =>
      recentAttendance.filter((record) =>
        matchesSearchQuery(
          [record.date, record.courseCode, record.courseName, record.status],
          searchQuery
        )
      ),
    [recentAttendance, searchQuery]
  );
  const {
    currentPage: coursePage,
    totalPages: courseTotalPages,
    startIndex: courseStartIndex,
    endIndex: courseEndIndex,
    totalItems: totalCourseItems,
    paginatedItems: paginatedCourseAttendance,
    canPreviousPage: canPreviousCoursePage,
    canNextPage: canNextCoursePage,
    setPage: setCoursePage,
    nextPage: nextCoursePage,
    previousPage: previousCoursePage,
  } = usePagination(filteredCourseAttendance, 6);
  const {
    currentPage: recentPage,
    totalPages: recentTotalPages,
    startIndex: recentStartIndex,
    endIndex: recentEndIndex,
    totalItems: totalRecentItems,
    paginatedItems: paginatedRecentAttendance,
    canPreviousPage: canPreviousRecentPage,
    canNextPage: canNextRecentPage,
    setPage: setRecentPage,
    nextPage: nextRecentPage,
    previousPage: previousRecentPage,
  } = usePagination(filteredRecentAttendance, 8);

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track your attendance across all courses</p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
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

              {!loading && paginatedCourseAttendance.length === 0 && (
                <div className="text-sm text-gray-400">
                  {searchQuery.trim() ? "No attendance records match your search." : "No attendance records found yet."}
                </div>
              )}

              {!loading && paginatedCourseAttendance.map((course) => {
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

              {!loading && filteredCourseAttendance.length > 0 && (
                <PaginationControls
                  currentPage={coursePage}
                  totalPages={courseTotalPages}
                  startIndex={courseStartIndex}
                  endIndex={courseEndIndex}
                  totalItems={totalCourseItems}
                  itemLabel="courses"
                  onPageChange={setCoursePage}
                  onPrevious={previousCoursePage}
                  onNext={nextCoursePage}
                  canPreviousPage={canPreviousCoursePage}
                  canNextPage={canNextCoursePage}
                  className="rounded-xl border border-gray-100"
                />
              )}
            </div>
          )}

          {activeTab === "recent" && (
            <>
              {loading && <div className="text-sm text-gray-400">Loading recent attendance...</div>}

              {!loading && paginatedRecentAttendance.length === 0 && (
                <div className="text-sm text-gray-400">
                  {searchQuery.trim() ? "No recent attendance matches your search." : "No recent attendance found yet."}
                </div>
              )}

              {!loading && paginatedRecentAttendance.length > 0 && (
                <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className="border-b border-gray-100">
                        <TableHeader className="px-0">Date</TableHeader>
                        <TableHeader className="px-0">Course</TableHeader>
                        <TableHeader className="px-0">Status</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedRecentAttendance.map((record) => (
                        <TableRow key={record._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <TableCell className="px-0 py-3 text-gray-600 text-xs">{record.date}</TableCell>
                          <TableCell className="px-0 py-3">
                            <div className="font-medium text-gray-800">{record.courseName}</div>
                            <div className="text-xs text-gray-400">{record.courseCode}</div>
                          </TableCell>
                          <TableCell className="px-0 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                record.status === "present"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-600"
                              }`}
                            >
                              {record.status === "present" ? "Present" : "Absent"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <PaginationControls
                  currentPage={recentPage}
                  totalPages={recentTotalPages}
                  startIndex={recentStartIndex}
                  endIndex={recentEndIndex}
                  totalItems={totalRecentItems}
                  itemLabel="records"
                  onPageChange={setRecentPage}
                  onPrevious={previousRecentPage}
                  onNext={nextRecentPage}
                  canPreviousPage={canPreviousRecentPage}
                  canNextPage={canNextRecentPage}
                  className="mt-4 rounded-xl border border-gray-100"
                />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyAttendance;
