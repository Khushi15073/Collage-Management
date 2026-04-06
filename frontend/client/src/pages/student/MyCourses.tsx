import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Users, Calendar } from "lucide-react";
import StatsStrip from "../../components/StatsStrip";
import PaginationControls from "../../components/ui/PaginationControls";
import { usePagination } from "../../hooks/usePagination";
import { matchesSearchQuery } from "../../utils/search";
import SearchField from "../../components/ui/SearchField";

const BASE_URL = "http://localhost:8000";

type StudentCourse = {
  _id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  status: string;
  instructorName: string;
};

type StudentDashboardSummary = {
  counts: {
    enrolledCourses: number;
    totalCredits: number;
  };
  enrolledCourses: StudentCourse[];
  courseAttendance?: {
    code: string;
    name: string;
    present: number;
    total: number;
    percentage: number;
  }[];
};

function MyCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [summary, setSummary] = useState<StudentDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<StudentCourse | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
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
          setError(requestError.response?.data?.message || "Failed to fetch courses");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const courses = summary?.enrolledCourses || [];
  const totalCourses = summary?.counts.enrolledCourses ?? 0;
  const totalCredits = summary?.counts.totalCredits ?? 0;
  const courseAttendance = summary?.courseAttendance || [];
  const filteredCourses = useMemo(
    () =>
      courses.filter((course) =>
        matchesSearchQuery(
          [
            course.code,
            course.name,
            course.department,
            course.credits,
            course.status,
            course.instructorName,
          ],
          searchQuery
        )
      ),
    [courses, searchQuery]
  );

  function openCourseDetails(course: StudentCourse) {
    setSelectedCourse(course);
  }

  function closeCourseDetails() {
    setSelectedCourse(null);
  }

  const selectedCourseAttendance = selectedCourse
    ? courseAttendance.find((course) => course.code === selectedCourse.code)
    : null;
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
  } = usePagination(filteredCourses, 6);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-6">
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
      </div>

      <div className="mb-5 max-w-md shrink-0">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search my courses..."
        />
      </div>

      {error && (
        <div className="mb-6 shrink-0 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <StatsStrip
        outerClassName="mb-4"
        items={[
          { title: "Total Courses", value: String(totalCourses), loading },
          { title: "Total Credits", value: String(totalCredits), loading },
        ]}
      />

      {loading && (
        <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
          Loading courses...
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="shrink-0 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-400">
          {searchQuery.trim() ? "No courses match your search." : "You are not enrolled in any course yet."}
        </div>
      )}

      {!loading && filteredCourses.length > 0 && (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="min-h-0 flex-1 overflow-auto p-5 pr-4">
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {paginatedCourses.map((course) => (
                <div
                  key={course._id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                        {course.code}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{course.credits} Credits</span>
                  </div>

                  <h3 className="mb-3 text-base font-bold text-gray-900">{course.name}</h3>

                  <div className="mb-4 space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users size={12} className="text-gray-400" />
                      {course.instructorName}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <BookOpen size={12} className="text-gray-400" />
                      {course.department}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar size={12} className="text-gray-400" />
                      Status: {course.status}
                    </div>
                  </div>

                  <div className="flex">
                    <button
                      onClick={() => openCourseDetails(course)}
                      className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

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
        </div>
      )}

      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedCourse.name}</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {selectedCourse.code} • {selectedCourse.department}
                </p>
              </div>
              <button
                onClick={closeCourseDetails}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Instructor
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {selectedCourse.instructorName}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Credits
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {selectedCourse.credits}
                </p>
              </div>

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Status
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {selectedCourse.status}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-gray-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Attendance
              </p>
              {selectedCourseAttendance ? (
                <>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-700">
                    <span>
                      {selectedCourseAttendance.present} / {selectedCourseAttendance.total} classes attended
                    </span>
                    <span className="font-semibold text-blue-700">
                      {selectedCourseAttendance.percentage}%
                    </span>
                  </div>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${selectedCourseAttendance.percentage}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-gray-600">
                  No attendance records available for this course yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyCourses;
