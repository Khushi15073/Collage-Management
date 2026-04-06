import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { ListFilter, X } from "lucide-react";
import StatsStrip from "../../components/StatsStrip";
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
import { matchesSearchQuery } from "../../utils/search";
import SearchField from "../../components/ui/SearchField";
import { useToastMessage } from "../../hooks/useToastMessage";

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
  const [searchQuery, setSearchQuery] = useState("");

  const [courses, setCourses] = useState<AttendanceCourse[]>([]);
  const [courseId, setCourseId] = useState("");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "absent">("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  useToastMessage(error, "error");
  useToastMessage(success, "success");

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
  const activeCourse = courses.find((course) => course._id === courseId) || null;
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const values = [student.name, student.email, student.phoneNumber, student.status];
      const matchesHeaderSearch = matchesSearchQuery(values, searchQuery);
      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesHeaderSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter, students]);
  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    totalItems,
    paginatedItems: paginatedStudents,
    canPreviousPage,
    canNextPage,
    setPage,
    nextPage,
    previousPage,
  } = usePagination(filteredStudents, 10);

  function resetFilters() {
    setStatusFilter("all");
    setDate(today);
  }

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
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="mt-1 text-gray-400">Record student attendance for your classes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            <ListFilter size={16} />
            Filters
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loadingSheet || !courseId}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>

      <div className="mb-5 max-w-md">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search students in attendance..."
        />
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

      <StatsStrip
        outerClassName="mb-6 overflow-visible px-0 pb-0"
        innerClassName="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3"
        items={[
          {
            title: "Present",
            value: String(present),
            loading: loadingSheet || loadingCourses,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
          {
            title: "Absent",
            value: String(absent),
            loading: loadingSheet || loadingCourses,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
          {
            title: "Attendance %",
            value: `${percentage}%`,
            loading: loadingSheet || loadingCourses,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
        ]}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Attendance Sheet</h2>
              <p className="mt-1 text-sm text-gray-400">
                {activeCourse
                  ? `${activeCourse.code} - ${activeCourse.name} • ${date}`
                  : "No course is available to mark attendance"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => markAll("present")}
                disabled={filteredStudents.length === 0}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll("absent")}
                disabled={filteredStudents.length === 0}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHead>
              <TableRow className="border-b border-gray-100 bg-gray-50">
                <TableHeader>Student</TableHeader>
                <TableHeader>Contact</TableHeader>
                <TableHeader>Present</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {(loadingCourses || loadingSheet) && (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-sm text-gray-400">
                    Loading attendance sheet...
                  </TableCell>
                </TableRow>
              )}

              {!loadingCourses && !loadingSheet && paginatedStudents.map((student) => {
                const isPresent = student.status === "present";

                return (
                  <TableRow
                    key={student._id}
                    className={`border-b border-gray-50 transition ${
                      isPresent ? "bg-green-50/40" : "hover:bg-gray-50"
                    }`}
                  >
                    <TableCell>
                      <div className="font-bold text-gray-800">{student.name}</div>
                      <div className="text-xs text-gray-400">{student._id}</div>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">
                      <div>{student.email}</div>
                      <div>{student.phoneNumber}</div>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                );
              })}

              {!loadingCourses && !loadingSheet && paginatedStudents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-12 text-center text-sm text-gray-400">
                    {courseId
                      ? filteredStudents.length === 0 && students.length > 0
                        ? "No students match the selected filters."
                        : "No students are assigned to this course."
                      : "No course is available to mark attendance."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemLabel="students"
          onPageChange={setPage}
          onPrevious={previousPage}
          onNext={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
          className="text-gray-400"
        />
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 z-40 bg-black/20">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 h-full w-full cursor-default"
            onClick={() => setIsFilterOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Filter Attendance</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Choose from all available filter options
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-auto px-6 py-6">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Attendance Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "All", value: "all" },
                    { label: "Present", value: "present" },
                    { label: "Absent", value: "absent" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setStatusFilter(option.value as "all" | "present" | "absent")
                      }
                      className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                        statusFilter === option.value
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-semibold text-gray-800">Current Results</h3>
                <div className="mt-3 space-y-2 text-sm text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>Matched students</span>
                    <span className="font-semibold text-gray-900">{filteredStudents.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Present in filtered view</span>
                    <span className="font-semibold text-gray-900">
                      {filteredStudents.filter((student) => student.status === "present").length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Absent in filtered view</span>
                    <span className="font-semibold text-gray-900">
                      {filteredStudents.filter((student) => student.status === "absent").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700"
              >
                Apply
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default MarkAttendance;
