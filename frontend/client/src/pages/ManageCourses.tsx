import { useState } from "react";
import { Pencil, Trash2, Search, Plus, BookOpen, Users, Armchair } from "lucide-react";

// ✅ TypeScript: shape of a Course
type Course = {
  id: string;
  code: string;
  name: string;
  schedule: string;
  department: string;
  instructor: string;
  credits: number;
  enrolled: number;
  total: number;
  status: string;
};

// ✅ Fake course data
const courseList: Course[] = [
  { id: "1", code: "CS-301", name: "Data Structures & Algorithms", schedule: "Mon, Wed, Fri 10:00-11:00 AM", department: "Computer Science", instructor: "Prof. Michael Chen",  credits: 4, enrolled: 45, total: 50, status: "Active" },
  { id: "2", code: "MA-201", name: "Linear Algebra",               schedule: "Tue, Thu 2:00-3:30 PM",        department: "Mathematics",      instructor: "Dr. Sarah Johnson",   credits: 3, enrolled: 38, total: 40, status: "Active" },
  { id: "3", code: "EN-101", name: "Thermodynamics",               schedule: "Mon, Wed 9:00-10:30 AM",       department: "Engineering",      instructor: "Prof. Robert Taylor", credits: 4, enrolled: 42, total: 45, status: "Active" },
  { id: "4", code: "BU-401", name: "Marketing Management",         schedule: "Fri 1:00-4:00 PM",             department: "Business",         instructor: "Dr. Emily White",     credits: 3, enrolled: 40, total: 40, status: "Full"   },
];

// ✅ Empty form
const emptyForm = {
  code: "",
  name: "",
  schedule: "",
  department: "",
  instructor: "",
  credits: 3,
  enrolled: 0,
  total: 50,
  status: "Active",
};

function ManageCourses() {

  const [courses, setCourses]       = useState<Course[]>(courseList);
  const [search, setSearch]         = useState<string>("");
  const [showModal, setShowModal]   = useState<boolean>(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm]             = useState(emptyForm);

  // ─────────────────────────────────────────
  // Computed stats for the 3 stat cards
  // ─────────────────────────────────────────
  const totalCourses      = courses.length;
  const totalEnrollments  = courses.reduce((sum, c) => sum + c.enrolled, 0);
  const availableSeats    = courses.reduce((sum, c) => sum + (c.total - c.enrolled), 0);

  // ─────────────────────────────────────────
  // Filter courses by search
  // ─────────────────────────────────────────
  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.department.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────
  // Open Add modal
  // ─────────────────────────────────────────
  function openAddModal() {
    setEditCourse(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  // ─────────────────────────────────────────
  // Open Edit modal
  // ─────────────────────────────────────────
  function openEditModal(c: Course) {
    setEditCourse(c);
    setForm({
      code: c.code, name: c.name, schedule: c.schedule,
      department: c.department, instructor: c.instructor,
      credits: c.credits, enrolled: c.enrolled,
      total: c.total, status: c.status,
    });
    setShowModal(true);
  }

  // ─────────────────────────────────────────
  // Save: Add or Update
  // ─────────────────────────────────────────
  function handleSave() {
    if (editCourse) {
      setCourses(courses.map((c) =>
        c.id === editCourse.id ? { ...c, ...form } : c
      ));
    } else {
      const newId = String(courses.length + 1);
      setCourses([...courses, { id: newId, ...form }]);
    }
    setShowModal(false);
  }

  // ─────────────────────────────────────────
  // Delete a course
  // ─────────────────────────────────────────
  function handleDelete(id: string) {
    const sure = window.confirm("Delete this course?");
    if (sure) setCourses(courses.filter((c) => c.id !== id));
  }

  // ─────────────────────────────────────────
  // Update form field
  // ─────────────────────────────────────────
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    // credits, enrolled, total should be numbers
    const numFields = ["credits", "enrolled", "total"];
    setForm({ ...form, [name]: numFields.includes(name) ? Number(value) : value });
  }

  // ─────────────────────────────────────────
  // Enrollment progress bar color
  // ─────────────────────────────────────────
  function barColor(enrolled: number, total: number) {
    const pct = (enrolled / total) * 100;
    if (pct >= 100) return "bg-red-500";
    if (pct >= 80)  return "bg-blue-500";
    return "bg-blue-400";
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
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

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Total Courses */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Courses</p>
            <p className="text-3xl font-bold text-gray-900">{totalCourses}</p>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Users className="w-7 h-7 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Total Enrollments</p>
            <p className="text-3xl font-bold text-gray-900">{totalEnrollments}</p>
          </div>
        </div>

        {/* Available Seats */}
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

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Card Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Course List</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Head */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Code</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Course Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Instructor</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Credits</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Enrollment</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition">

                  {/* Code */}
                  <td className="px-6 py-4 font-bold text-gray-800">{c.code}</td>

                  {/* Course Name + Schedule */}
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.schedule}</p>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-gray-600">{c.department}</td>

                  {/* Instructor */}
                  <td className="px-6 py-4 text-gray-600">{c.instructor}</td>

                  {/* Credits */}
                  <td className="px-6 py-4 text-gray-600">{c.credits}</td>

                  {/* Enrollment Progress */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {/* Progress Bar */}
                      <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${barColor(c.enrolled, c.total)}`}
                          style={{ width: `${Math.min((c.enrolled / c.total) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {c.enrolled}/{c.total}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(c)}
                        className="text-gray-400 hover:text-blue-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {/* No results */}
              {filteredCourses.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredCourses.length} of {courses.length} courses
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">

            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {editCourse ? "Edit Course" : "Add New Course"}
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              {editCourse ? `Editing ${editCourse.code}` : "Fill in the course details below"}
            </p>

            <div className="grid grid-cols-2 gap-4">

              {/* Course Code */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Code</label>
                <input name="code" value={form.code} onChange={handleFormChange} placeholder="e.g. CS-301"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Credits */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Credits</label>
                <input name="credits" type="number" value={form.credits} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Course Name - full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Course Name</label>
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="e.g. Data Structures"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Schedule - full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Schedule</label>
                <input name="schedule" value={form.schedule} onChange={handleFormChange} placeholder="e.g. Mon, Wed 10:00-11:00 AM"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Department</label>
                <input name="department" value={form.department} onChange={handleFormChange} placeholder="e.g. Mathematics"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor</label>
                <input name="instructor" value={form.instructor} onChange={handleFormChange} placeholder="e.g. Dr. John"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Total Seats */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Total Seats</label>
                <input name="total" type="number" value={form.total} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Full</option>
                </select>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={handleSave}
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white rounded-lg py-2.5 text-sm font-semibold transition">
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