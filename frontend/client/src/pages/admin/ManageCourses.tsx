import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Search, Plus, BookOpen, Users, Armchair } from "lucide-react";
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

const emptyForm = {
  code: "",
  name: "",
  schedule: "",
  department: "",
  instructor: "",
  students: [] as string[],
  credits: 3,
  total: 50,
  status: "Active" as "Active" | "Inactive" | "Full",
};

const scheduleOptions = [
  "Mon, Wed, Fri 09:00 - 10:00 AM",
  "Mon, Wed, Fri 10:00 - 11:00 AM",
  "Mon, Wed, Fri 11:00 - 12:00 PM",
  "Mon, Wed 02:00 - 03:30 PM",
  "Tue, Thu 09:00 - 10:30 AM",
  "Tue, Thu 10:30 - 12:00 PM",
  "Tue, Thu 02:00 - 03:30 PM",
  "Sat 10:00 - 01:00 PM",
];

function ManageCourses() {
  const dispatch = useDispatch();

  const courses = useSelector((state: any) => state.courses.courses) as Course[];
  const loading = useSelector((state: any) => state.courses.loading) as boolean;
  const error = useSelector((state: any) => state.courses.error) as string | null;

  const faculty = useSelector((state: any) => state.faculty.faculty) as Faculty[];
  const facultyLoading = useSelector((state: any) => state.faculty.loading) as boolean;
  const facultyError = useSelector((state: any) => state.faculty.error) as string | null;
  const students = useSelector((state: any) => state.students.students) as Student[];
  const studentsLoading = useSelector((state: any) => state.students.loading) as boolean;
  const studentsError = useSelector((state: any) => state.students.error) as string | null;

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [studentSearch, setStudentSearch] = useState("");

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

  const filteredCourses = courses.filter((course) => {
    const query = search.toLowerCase();
    const instructorName = course.instructor?.name?.toLowerCase() || "";

    return (
      course.name.toLowerCase().includes(query) ||
      course.code.toLowerCase().includes(query) ||
      course.department.toLowerCase().includes(query) ||
      instructorName.includes(query)
    );
  });

  function resetForm() {
    setForm(emptyForm);
    setStudentSearch("");
  }

  function openAddModal() {
    setEditCourse(null);
    resetForm();
    dispatch(clearCourseError());
    setShowModal(true);
  }

  function openEditModal(course: Course) {
    setEditCourse(course);
    setForm({
      code: course.code,
      name: course.name,
      schedule: course.schedule,
      department: course.department,
      instructor: course.instructor?._id || "",
      students: course.students.map((student) => student._id),
      credits: course.credits,
      total: course.total,
      status: course.status,
    });
    dispatch(clearCourseError());
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditCourse(null);
    resetForm();
  }

  async function handleSave() {
    if (
      form.code === "" ||
      form.name === "" ||
      form.schedule === "" ||
      form.department === "" ||
      form.instructor === "" ||
      form.credits <= 0 ||
      form.total <= 0
    ) {
      return;
    }

    if (form.students.length > form.total) {
      return;
    }

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
    const numberFields = ["credits", "total"];

    setForm((current) => ({
      ...current,
      [name]: numberFields.includes(name) ? Number(value) : value,
    }));

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

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function selectAllStudents() {
    setForm((current) => ({
      ...current,
      students: students.slice(0, current.total).map((student) => student._id),
    }));

    if (error) {
      dispatch(clearCourseError());
    }
  }

  function clearAllStudents() {
    setForm((current) => ({
      ...current,
      students: [],
    }));

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
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all courses</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          <Plus size={15} /> Add Course
        </button>
      </div>

      {pageError && (
        <div className="mb-6 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Enrollments</p>
            <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <Armchair className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Available Seats</p>
            <p className="text-3xl font-bold text-gray-900">{availableSeats}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Course List</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-gray-50"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enrollment</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Students</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Loading courses...
                  </td>
                </tr>
              )}

              {!loading &&
                filteredCourses.map((course) => (
                  <tr key={course._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-bold text-gray-800">{course.code}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-800">{course.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{course.schedule}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{course.department}</td>
                    <td className="px-6 py-4 text-gray-600">{course.instructor?.name || "Unassigned"}</td>
                    <td className="px-6 py-4 text-gray-600">{course.credits}</td>
                    <td className="px-6 py-4">
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
                    </td>
                    <td className="px-6 py-4 text-gray-600">{course.students.length}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(course)}
                          className="text-gray-400 hover:text-blue-600 transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(course._id)}
                          className="text-gray-400 hover:text-red-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

              {!loading && filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Credits</label>
                <input
                  name="credits"
                  type="number"
                  min={1}
                  value={form.credits}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Data Structures"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Schedule</label>
                <select
                  name="schedule"
                  value={form.schedule}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select schedule</option>
                  {scheduleOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleFormChange}
                  placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                <select
                  name="instructor"
                  value={form.instructor}
                  onChange={handleFormChange}
                  disabled={facultyLoading}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Select faculty</option>
                  {faculty.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Seats</label>
                <input
                  name="total"
                  type="number"
                  min={1}
                  value={form.total}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                <input
                  value={studentSearch}
                  onChange={(event) => setStudentSearch(event.target.value)}
                  placeholder="Search students by name or email"
                  className="mb-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                disabled={loading}
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
