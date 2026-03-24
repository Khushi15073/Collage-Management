import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  clearStudentError,
} from "../features/studentSlice";
import type { Student } from "../features/studentSlice";
import { fetchRoles } from "../features/roleSlice";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  gender: "male" as "male" | "female" | "other",
  role: "",
};

function ManageStudents() {
  const dispatch = useDispatch();

  const students = useSelector((state: any) => state.students.students);
  const loading = useSelector((state: any) => state.students.loading);
  const error = useSelector((state: any) => state.students.error);

  const roles = useSelector((state: any) => state.roles.roles);
  const rolesLoading = useSelector((state: any) => state.roles.loading);
  const roleError = useSelector((state: any) => state.roles.error);

  const [search, setSearch] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchStudents() as any);
    if (roles.length === 0) {
      dispatch(fetchRoles() as any);
    }
  }, []);

  function openAddModal() {
    setEditStudent(null);
    setForm(emptyForm);
    dispatch(clearStudentError());
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditStudent(null);
    setForm(emptyForm);
  }

  function openEditModal(student: Student) {
    setEditStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      phoneNumber: student.phoneNumber,
      gender: student.gender,
      role: student.role?._id || "",
    });
    dispatch(clearStudentError());
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name || !form.email || !form.phoneNumber || !form.role) return;
    if (!editStudent && !form.password) return;

    if (editStudent) {
      const result = await dispatch(
        updateStudent({
          id: editStudent._id,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }) as any
      );

      if (updateStudent.fulfilled.match(result)) {
        closeModal();
      }
    } else {
      const result = await dispatch(
        createStudent({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          role: form.role,
        }) as any
      );

      if (createStudent.fulfilled.match(result)) {
        setCredentials({ email: form.email, password: form.password });
        closeModal();
      }
    }
  }

  async function handleDelete(id: string) {
    const sure = window.confirm("Are you sure you want to delete this student?");
    if (!sure) return;
    dispatch(deleteStudent(id) as any);
  }

  function handleCopy() {
    if (!credentials) return;
    navigator.clipboard.writeText(
      "Email: " + credentials.email + "\nPassword: " + credentials.password
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearStudentError());
  }

  const filteredStudents = students.filter((s: Student) =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  const pageError = error || roleError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all student records</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          + Add Student
        </button>
      </div>

      {pageError && (
        <div
          className={
            "mb-4 rounded-xl border px-4 py-3 text-sm " +
            (isSessionError
              ? "border-amber-200 bg-amber-50 text-amber-800"
              : "border-red-200 bg-red-50 text-red-700")
          }
        >
          {isSessionError
            ? "Session expired or unauthorized. Please log in again, then refresh this page."
            : pageError}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Student List</h2>
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-gray-50"
          />
        </div>

        <div className="overflow-x-auto">
          {loading && students.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading students...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Gender</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student: Student) => (
                  <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{student.email}</td>
                    <td className="px-6 py-4 text-gray-500 text-xs">{student.phoneNumber}</td>
                    <td className="px-6 py-4 text-gray-500 capitalize">{student.gender}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                        {student.role?.name || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">
                      {pageError ? "Unable to load students." : "No students found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {editStudent ? "Edit Student" : "Add Student"}
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  {editStudent
                    ? "Update the student details below"
                    : "Create a new student account"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="rounded-lg px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
              >
                Close
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter student name"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editStudent ? "New Password" : "Password"}
                </label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={editStudent ? "Leave blank to keep current" : "Enter password"}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleFormChange}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleFormChange}
                  disabled={rolesLoading}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">{rolesLoading ? "Loading roles..." : "Select role"}</option>
                  {roles.map((role: any) => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={closeModal}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : editStudent ? "Update Student" : "Create Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {credentials && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Student Created</h3>
              <p className="mt-1 text-xs text-gray-400">Share these login credentials with the user</p>
            </div>
            <button
              onClick={() => setCredentials(null)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
            <p><span className="font-semibold">Email:</span> {credentials.email}</p>
            <p className="mt-2"><span className="font-semibold">Password:</span> {credentials.password}</p>
          </div>

          <button
            onClick={handleCopy}
            className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            {copied ? "Copied" : "Copy Credentials"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
