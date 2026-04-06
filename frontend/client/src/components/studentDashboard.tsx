import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/Table";
import PaginationControls from "./ui/PaginationControls";
import { usePagination } from "../hooks/usePagination";
import StatsStrip from "./StatsStrip";
import { matchesSearchQuery } from "../utils/search";
import SearchField from "./ui/SearchField";
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
  },
  {
    key: "overallAttendance",
    label: "Attendance",
    suffix: "%",
  },
  {
    key: "classesAttended",
    label: "Classes Attended",
  },
  {
    key: "classesMissed",
    label: "Classes Missed",
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
  const [searchQuery, setSearchQuery] = useState("");
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCourseAttendance = useMemo(() => {
    const items = summary?.courseAttendance || [];
    return items.filter((course) =>
      matchesSearchQuery(
        [course.code, course.name, course.present, course.total, course.percentage, `${course.percentage}%`],
        normalizedQuery
      )
    );
  }, [normalizedQuery, summary?.courseAttendance]);

  const filteredEnrolledCourses = useMemo(() => {
    const items = summary?.enrolledCourses || [];

    return items.filter((course) =>
      matchesSearchQuery(
        [
          course.code,
          course.name,
          course.department,
          course.status,
          course.instructorName,
          course.credits,
        ],
        normalizedQuery
      )
    );
  }, [normalizedQuery, summary?.enrolledCourses]);

  const filteredRecentAttendance = useMemo(() => {
    const items = summary?.recentAttendance || [];

    return items.filter((record) =>
      matchesSearchQuery([record.date, record.courseCode, record.courseName, record.status], normalizedQuery)
    );
  }, [normalizedQuery, summary?.recentAttendance]);
  const {
    currentPage: attendancePage,
    totalPages: attendanceTotalPages,
    startIndex: attendanceStartIndex,
    endIndex: attendanceEndIndex,
    totalItems: totalAttendanceItems,
    paginatedItems: paginatedCourseAttendance,
    canPreviousPage: canPreviousAttendancePage,
    canNextPage: canNextAttendancePage,
    setPage: setAttendancePage,
    nextPage: nextAttendancePage,
    previousPage: previousAttendancePage,
  } = usePagination(filteredCourseAttendance, 5);
  const {
    currentPage: coursesPage,
    totalPages: coursesTotalPages,
    startIndex: coursesStartIndex,
    endIndex: coursesEndIndex,
    totalItems: totalEnrolledItems,
    paginatedItems: paginatedEnrolledCourses,
    canPreviousPage: canPreviousCoursesPage,
    canNextPage: canNextCoursesPage,
    setPage: setCoursesPage,
    nextPage: nextCoursesPage,
    previousPage: previousCoursesPage,
  } = usePagination(filteredEnrolledCourses, 5);
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
  } = usePagination(filteredRecentAttendance, 6);

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-400">Welcome back, {user?.name || "Student"}</p>
      </div>

      <div className="mb-5 max-w-md">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search your dashboard..."
        />
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatsStrip
        outerClassName="mb-4"
        items={statCardConfig.map((card) => ({
          title: card.label,
          value: `${getCardValue(summary, card.key)}${"suffix" in card ? card.suffix : ""}`,
          loading,
        }))}
      />

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800">Course-wise Attendance</h2>
            <span className="text-xs text-gray-400">
              Credits: {loading ? "..." : summary?.counts.totalCredits ?? 0}
            </span>
          </div>

          <div className="space-y-4">
            {loading && <div className="text-sm text-gray-400">Loading attendance...</div>}

            {!loading && paginatedCourseAttendance.length === 0 && (
              <div className="text-sm text-gray-400">
                {normalizedQuery ? "No attendance records match your search." : "No attendance records found yet."}
              </div>
            )}

            {!loading &&
              paginatedCourseAttendance.map((course) => (
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

            {!loading && filteredCourseAttendance.length > 0 && (
              <PaginationControls
                currentPage={attendancePage}
                totalPages={attendanceTotalPages}
                startIndex={attendanceStartIndex}
                endIndex={attendanceEndIndex}
                totalItems={totalAttendanceItems}
                itemLabel="courses"
                onPageChange={setAttendancePage}
                onPrevious={previousAttendancePage}
                onNext={nextAttendancePage}
                canPreviousPage={canPreviousAttendancePage}
                canNextPage={canNextAttendancePage}
                className="rounded-xl border border-gray-100"
              />
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-bold text-gray-800">Enrolled Courses</h2>

          <div className="space-y-3">
            {loading && <div className="text-sm text-gray-400">Loading courses...</div>}

            {!loading && paginatedEnrolledCourses.length === 0 && (
              <div className="text-sm text-gray-400">
                {normalizedQuery ? "No enrolled courses match your search." : "You are not enrolled in any course yet."}
              </div>
            )}

            {!loading &&
              paginatedEnrolledCourses.map((course) => (
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
                  </div>
                </div>
              ))}

            {!loading && filteredEnrolledCourses.length > 0 && (
              <PaginationControls
                currentPage={coursesPage}
                totalPages={coursesTotalPages}
                startIndex={coursesStartIndex}
                endIndex={coursesEndIndex}
                totalItems={totalEnrolledItems}
                itemLabel="courses"
                onPageChange={setCoursesPage}
                onPrevious={previousCoursesPage}
                onNext={nextCoursesPage}
                canPreviousPage={canPreviousCoursesPage}
                canNextPage={canNextCoursesPage}
                className="rounded-xl border border-gray-100"
              />
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-base font-bold text-gray-800">Recent Attendance</h2>

        {loading && <div className="text-sm text-gray-400">Loading recent attendance...</div>}

        {!loading && paginatedRecentAttendance.length === 0 && (
          <div className="text-sm text-gray-400">
            {normalizedQuery ? "No recent attendance matches your search." : "No attendance activity found yet."}
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
                  <TableRow key={record._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <TableCell className="px-0 py-3 text-xs text-gray-600">{record.date}</TableCell>
                    <TableCell className="px-0 py-3">
                      <div className="font-medium text-gray-800">{record.courseName}</div>
                      <div className="text-xs text-gray-400">{record.courseCode}</div>
                    </TableCell>
                    <TableCell className="px-0 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
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
      </div>
    </div>
  );
}

export default StudentDashboard;
