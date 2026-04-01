import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  clearStudentError,
  setStudentLimit,
  setStudentPage,
} from "../../features/studentSlice";
import type { Student } from "../../features/studentSlice";
import { fetchRoles } from "../../features/roleSlice";
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
import { useDashboardSearch } from "../../context/DashboardSearchContext";

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
  const { searchQuery } = useDashboardSearch();

  const students = useSelector((state: any) => state.students.students);
  const loading = useSelector((state: any) => state.students.loading);
  const error = useSelector((state: any) => state.students.error);
  const currentPage = useSelector((state: any) => state.students.currentPage);
  const limit = useSelector((state: any) => state.students.limit);
  const totalItems = useSelector((state: any) => state.students.totalItems);
  const totalPages = useSelector((state: any) => state.students.totalPages);

  const roles = useSelector((state: any) => state.roles.roles);
  const rolesLoading = useSelector((state: any) => state.roles.loading);
  const roleError = useSelector((state: any) => state.roles.error);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [emailNotice, setEmailNotice] = useState<{ sent: boolean; message: string } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const previousSearchRef = useRef(searchQuery);

  useEffect(() => {
    if (roles.length === 0) {
      dispatch(fetchRoles() as any);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    if (previousSearchRef.current !== debouncedSearch) {
      previousSearchRef.current = debouncedSearch;

      if (currentPage !== 1) {
        dispatch(setStudentPage(1));
        return;
      }
    }

    dispatch(
      fetchStudents({
        page: currentPage,
        limit,
        search: debouncedSearch,
      }) as any
    );
  }, [currentPage, debouncedSearch, dispatch, limit]);

  function openAddModal() {
    setEditStudent(null);
    setForm(emptyForm);
    setEmailNotice(null);
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
        dispatch(
          fetchStudents({
            page: currentPage,
            limit,
            search: debouncedSearch,
          }) as any
        );
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
        setEmailNotice({
          sent: result.payload.emailSent,
          message: result.payload.emailSent
            ? `Credentials were emailed to ${form.email}.`
            : result.payload.emailError || "Student created, but email could not be sent.",
        });
        dispatch(setStudentPage(1));
        dispatch(
          fetchStudents({
            page: 1,
            limit,
            search: debouncedSearch,
          }) as any
        );
        closeModal();
      }
    }
  }

  async function handleDelete(id: string) {
    const sure = window.confirm("Are you sure you want to delete this student?");
    if (!sure) return;
    const result = await dispatch(deleteStudent(id) as any);

    if (deleteStudent.fulfilled.match(result)) {
      const nextPage = students.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      dispatch(setStudentPage(nextPage));
    }
  }

  function handleFormChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) dispatch(clearStudentError());
  }

  const pageError = error || roleError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + students.length - 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = totalPages > 0 && currentPage < totalPages;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
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

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Student List</h2>
            <p className="mt-1 text-sm text-gray-400">
              Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-500">
            <span>Rows</span>
            <select
              value={limit}
              onChange={(event) => dispatch(setStudentLimit(Number(event.target.value)))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[10, 20, 50, 100].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          {loading && students.length === 0 ? (
            <div className="py-16 text-center text-gray-400 text-sm">Loading students...</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow className="bg-gray-50 border-b border-gray-100">
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Email</TableHeader>
                  <TableHeader>Phone</TableHeader>
                  <TableHeader>Gender</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student: Student) => (
                  <TableRow key={student._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <TableCell className="font-medium text-gray-800">{student.name}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{student.email}</TableCell>
                    <TableCell className="text-gray-500 text-xs">{student.phoneNumber}</TableCell>
                    <TableCell className="text-gray-500 capitalize">{student.gender}</TableCell>
                    <TableCell>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 capitalize">
                        {student.role?.name || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-400">
                      {pageError ? "Unable to load students." : "No students found."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={totalItems}
          itemLabel="students"
          onPageChange={(page) => dispatch(setStudentPage(page))}
          onPrevious={() => dispatch(setStudentPage(currentPage - 1))}
          onNext={() => dispatch(setStudentPage(currentPage + 1))}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />
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

      {emailNotice && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Student Created</h3>
              <p className="mt-1 text-xs text-gray-400">Credential email delivery status</p>
            </div>
            <button
              onClick={() => setEmailNotice(null)}
              className="rounded-lg px-2 py-1 text-xs text-gray-500 hover:bg-gray-100"
            >
              Close
            </button>
          </div>

          <div
            className={`rounded-xl p-4 text-sm ${
              emailNotice.sent
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {emailNotice.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStudents;
