import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  clearCourseError,
  createCourse,
  deleteCourse,
  fetchCourses,
  updateCourse,
} from "../../features/courseSlice";
import type { Course } from "../../features/courseSlice";
import { fetchFaculty } from "../../features/facultySlice";
import type { Faculty } from "../../features/facultySlice";
import { fetchStudents } from "../../features/studentSlice";
import type { Student } from "../../features/studentSlice";
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
import { hasPermission } from "../../access/appAccess";

const emptyForm = {
  code: "",
  name: "",
  department: "",
  instructor: "",
  students: [] as string[],
  total: 50,
  status: "Active" as "Active" | "Inactive" | "Full",
};

type FormErrors = Partial<Record<"code" | "name" | "department" | "instructor" | "total", string>>;

function ManageCourses() {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const courses = useSelector((state: any) => state.courses.courses) as Course[];
  const loading = useSelector((state: any) => state.courses.loading) as boolean;
  const error = useSelector((state: any) => state.courses.error) as string | null;

  const faculty = useSelector((state: any) => state.faculty.faculty) as Faculty[];
  const facultyLoading = useSelector((state: any) => state.faculty.loading) as boolean;
  const facultyError = useSelector((state: any) => state.faculty.error) as string | null;
  const students = useSelector((state: any) => state.students.students) as Student[];
  const studentsLoading = useSelector((state: any) => state.students.loading) as boolean;
  const studentsError = useSelector((state: any) => state.students.error) as string | null;
  const user = useSelector((state: any) => state.auth.user);

  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [studentSearch, setStudentSearch] = useState("");
  const [formError, setFormError] = useState("");
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    dispatch(fetchCourses() as any);
    if (faculty.length === 0) {
      dispatch(fetchFaculty() as any);
    }
    if (students.length === 0) {
      dispatch(fetchStudents() as any);
    }
  }, []);

  const totalCourses = courses.length;
  const totalEnrollments = courses.reduce((sum, course) => sum + course.enrolled, 0);
  const availableSeats = courses.reduce((sum, course) => sum + (course.total - course.enrolled), 0);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const values = [
        course.code,
        course.name,
        course.department,
        course.instructor?.name || "",
        course.status,
        `${course.enrolled}/${course.total}`,
        String(course.enrolled),
        String(course.total),
        String(course.students.length),
      ];

      return matchesSearchQuery(values, searchQuery);
    });
  }, [courses, searchQuery]);
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
  } = usePagination(filteredCourses, 8);
  const canCreate = hasPermission(user, "create_courses");
  const canUpdate = hasPermission(user, "update_courses");
  const canDelete = hasPermission(user, "delete_courses");

  function resetForm() {
    setForm(emptyForm);
    setStudentSearch("");
    setFormError("");
    setFormErrors({});
  }

  function openAddModal() {
    setEditCourse(null);
    resetForm();
    dispatch(clearCourseError());
    setFormError("");
    setShowModal(true);
  }

  function openEditModal(course: Course) {
    setEditCourse(course);
    setForm({
      code: course.code,
      name: course.name,
      department: course.department,
      instructor: course.instructor?._id || "",
      students: course.students.map((student) => student._id),
      total: course.total,
      status: course.status,
    });
    dispatch(clearCourseError());
    setFormError("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditCourse(null);
    resetForm();
  }

  async function handleSave() {
    const nextErrors: FormErrors = {};

    if (!form.code.trim()) nextErrors.code = "Course code is required.";
    if (!form.name.trim()) nextErrors.name = "Course name is required.";
    if (!form.department.trim()) nextErrors.department = "Department is required.";
    if (!form.instructor) nextErrors.instructor = "Instructor is required.";
    if (form.total <= 0) nextErrors.total = "Total seats must be greater than 0.";

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setFormError("");
      return;
    }

    if (form.students.length > form.total) {
      setFormError("Selected students cannot exceed total seats.");
      return;
    }

    setFormError("");

    if (editCourse) {
      const result = await dispatch(
        updateCourse({
          id: editCourse._id,
          ...form,
        }) as any
      );

      if (updateCourse.fulfilled.match(result)) {
        closeModal();
      }
      return;
    }

    const result = await dispatch(createCourse(form) as any);
    if (createCourse.fulfilled.match(result)) {
      closeModal();
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Delete this course?");
    if (confirmed === false) {
      return;
    }

    dispatch(deleteCourse(id) as any);
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target;
    const numberFields = ["total"];

    setForm((current) => ({
      ...current,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));
    setFormErrors((current) => {
      if (!current[name as keyof FormErrors]) return current;
      const next = { ...current };
      delete next[name as keyof FormErrors];
      return next;
    });

    if (formError) {
      setFormError("");
    }

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function toggleStudent(studentId: string) {
    setForm((current) => {
      const exists = current.students.includes(studentId);
      const nextStudents = exists
        ? current.students.filter((id) => id !== studentId)
        : [...current.students, studentId];

      return {
        ...current,
        students: nextStudents,
      };
    });

    if (formError) {
      setFormError("");
    }

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function selectAllStudents() {
    setForm((current) => ({
      ...current,
      students: students.slice(0, current.total).map((student) => student._id),
    }));

    if (formError) {
      setFormError("");
    }

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function clearAllStudents() {
    setForm((current) => ({
      ...current,
      students: [],
    }));

    if (formError) {
      setFormError("");
    }

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function barColor(enrolled: number, total: number) {
    const pct = total === 0 ? 0 : (enrolled / total) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80) return "bg-blue-500";
    return "bg-blue-400";
  }

  const pageError = error || facultyError || studentsError;
  const filteredStudents = students.filter((student) => {
    const query = studentSearch.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });
  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all courses</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!canCreate}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      <div className="mb-5 max-w-md">
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search courses..."
        />
      </div>

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <StatsStrip
        outerClassName="mb-5 overflow-visible px-0 pb-0"
        innerClassName="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3"
        items={[
          {
            title: "Total Courses",
            value: String(totalCourses),
            loading,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
          {
            title: "Total Enrollments",
            value: String(totalEnrollments),
            loading,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
          {
            title: "Available Seats",
            value: String(availableSeats),
            loading,
            className: "w-full min-w-0 min-h-[76px] py-3",
          },
        ]}
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Course List</h2>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          <Table>
            <TableHead>
              <TableRow className="border-b border-gray-100">
                <TableHeader>Code</TableHeader>
                <TableHeader>Course Name</TableHeader>
                <TableHeader>Department</TableHeader>
                <TableHeader>Instructor</TableHeader>
                <TableHeader>Enrollment</TableHeader>
                <TableHeader>Students</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    Loading courses...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                paginatedCourses.map((course) => (
                  <TableRow key={course._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <TableCell className="font-bold text-gray-800">{course.code}</TableCell>
                    <TableCell>
                      <p className="font-semibold text-gray-800">{course.name}</p>
                    </TableCell>
                    <TableCell className="text-gray-600">{course.department}</TableCell>
                    <TableCell className="text-gray-600">{course.instructor?.name || "Unassigned"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-2 rounded-full ${barColor(course.enrolled, course.total)}`}
                            style={{ width: `${Math.min((course.enrolled / course.total) * 100 || 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {course.enrolled}/{course.total}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{course.students.length}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(course)}
                          disabled={!canUpdate}
                          className="text-gray-400 hover:text-blue-600 transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          disabled={!canDelete}
                          className="text-gray-400 hover:text-red-600 transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && paginatedCourses.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    No courses found.
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
          itemLabel="courses"
          onPageChange={setPage}
          onPrevious={previousPage}
          onNext={nextPage}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {editCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <p className="text-xs text-gray-400">
                {editCourse ? `Editing ${editCourse.code}` : "Fill in the course details below"}
              </p>
            </div>

            <div className="overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Code</label>
                <input
                  name="code"
                  value={form.code}
                  onChange={handleFormChange}
                  placeholder="e.g. CS-301"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.code ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.code && <p className="mt-1 text-xs text-red-600">{formErrors.code}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Data Structures"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                  placeholder="e.g. Mathematics"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.department ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.department && <p className="mt-1 text-xs text-red-600">{formErrors.department}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                <select
                  name="instructor"
                  value={form.instructor}
                  onChange={handleFormChange}
                  disabled={facultyLoading}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
                    formErrors.instructor ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">Select faculty</option>
                  {faculty.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                {formErrors.instructor && <p className="mt-1 text-xs text-red-600">{formErrors.instructor}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Seats</label>
                <input
                  name="total"
                  type="number"
                  min={1}
                  value={form.total}
                  onChange={handleFormChange}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.total ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.total && <p className="mt-1 text-xs text-red-600">{formErrors.total}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              <div className="col-span-2">
                <div className="mb-1 flex items-center justify-between">
                  <label className="block text-xs font-semibold text-gray-500">
                    Enroll Students
                  </label>
                  <span className="text-xs text-gray-400">
                    {form.students.length}/{form.total} selected
                  </span>
                </div>
                <div className="mb-3 flex gap-2">
                  <button
                    type="button"
                    onClick={selectAllStudents}
                    disabled={studentsLoading || students.length === 0}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllStudents}
                    disabled={form.students.length === 0}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
                  >
                    Clear All
                  </button>
                </div>
                <SearchField
                  value={studentSearch}
                  onChange={setStudentSearch}
                  placeholder="Search students by name or email"
                  className="mb-3"
                />
                <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-200 p-3">
                  {studentsLoading && (
                    <div className="text-sm text-gray-400">Loading students...</div>
                  )}
                  {!studentsLoading && filteredStudents.map((student) => {
                    const checked = form.students.includes(student._id);
                    const disableUnchecked = checked === false && form.students.length >= form.total;

                    return (
                      <label
                        key={student._id}
                        className={`flex items-start gap-3 rounded-lg px-2 py-2 transition ${
                          disableUnchecked ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disableUnchecked}
                          onChange={() => toggleStudent(student._id)}
                          className="mt-0.5 h-4 w-4 accent-blue-600"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{student.name}</div>
                          <div className="text-xs text-gray-400">{student.email}</div>
                        </div>
                      </label>
                    );
                  })}
                  {!studentsLoading && filteredStudents.length === 0 && (
                    <div className="text-sm text-gray-400">No students match your search.</div>
                  )}
                </div>
                {form.students.length > form.total && (
                  <p className="mt-2 text-xs text-red-600">
                    Selected students cannot exceed total seats.
                  </p>
                )}
              </div>
            </div>

            {formError && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}
            </div>

            <div className="flex gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={closeModal}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || (editCourse ? !canUpdate : !canCreate)}
                className="flex-1 bg-gray-900 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg py-2.5 text-sm font-semibold transition"
              >
                {editCourse ? "Save Changes" : "Add Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageCourses;
