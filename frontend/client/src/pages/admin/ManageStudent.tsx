import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  clearStudentError,
  setStudentPage,
} from "../../features/studentSlice";
import type { Student } from "../../features/studentSlice";
import { fetchRoles } from "../../features/roleSlice";
import { fetchDegrees } from "../../features/degreeSlice";
import type { DegreeRecord } from "../../features/degreeSlice";
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
import { hasPermission } from "../../access/appAccess";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  phoneNumber: "",
  gender: "male" as "male" | "female" | "other",
  role: "",
  degree: "",
};

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>;

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
  const degrees = useSelector((state: any) => state.degrees.degrees) as DegreeRecord[];
  const degreesLoading = useSelector((state: any) => state.degrees.loading) as boolean;
  const degreeError = useSelector((state: any) => state.degrees.error) as string | null;
  const user = useSelector((state: any) => state.auth.user);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [emailNotice, setEmailNotice] = useState<{ sent: boolean; message: string } | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const previousSearchRef = useRef(searchQuery);

  useEffect(() => {
    if (roles.length === 0) {
      dispatch(fetchRoles() as any);
    }
    if (degrees.length === 0) {
      dispatch(fetchDegrees() as any);
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
    setFormErrors({});
    setEmailNotice(null);
    dispatch(clearStudentError());
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditStudent(null);
    setForm(emptyForm);
    setFormErrors({});
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
      degree: student.degree?.id || "",
    });
    setFormErrors({});
    dispatch(clearStudentError());
    setShowModal(true);
  }

  async function handleSave() {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!form.role) nextErrors.role = "Role is required.";
    if (!form.degree) nextErrors.degree = "Degree is required.";
    if (!editStudent && !form.password.trim()) nextErrors.password = "Password is required.";

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (editStudent) {
      const result = await dispatch(
        updateStudent({
          id: editStudent._id,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          role: form.role,
          degree: form.degree,
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
          degree: form.degree,
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
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setFormErrors((current) => {
      if (!current[name as keyof typeof emptyForm]) return current;
      const next = { ...current };
      delete next[name as keyof typeof emptyForm];
      return next;
    });
    if (error) dispatch(clearStudentError());
  }

  const pageError = error || roleError || degreeError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + students.length - 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = totalPages > 0 && currentPage < totalPages;
  const canCreate = hasPermission(user, "create_students");
  const canUpdate = hasPermission(user, "update_students");
  const canDelete = hasPermission(user, "delete_students");

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all student records</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!canCreate}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:cursor-not-allowed disabled:bg-gray-400"
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
          </div>
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
                  <TableHeader>Degree</TableHeader>
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
                    <TableCell className="text-gray-500 text-xs">
                      {student.degree?.degreeName || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(student)}
                          disabled={!canUpdate}
                          className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          disabled={!canDelete}
                          className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-12 text-center text-sm text-gray-400">
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
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter student name"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter email"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
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
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder={editStudent ? "Leave blank to keep current" : "Enter password"}
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.phoneNumber ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter phone number"
                />
                {formErrors.phoneNumber && <p className="mt-1 text-xs text-red-600">{formErrors.phoneNumber}</p>}
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
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formErrors.role ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">{rolesLoading ? "Loading roles..." : "Select role"}</option>
                  {roles.map((role: any) => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.role && <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Degree</label>
                <select
                  name="degree"
                  value={form.degree}
                  onChange={handleFormChange}
                  disabled={degreesLoading}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formErrors.degree ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">{degreesLoading ? "Loading degrees..." : "Select degree"}</option>
                  {degrees.map((degree) => (
                    <option key={degree.id} value={degree.id}>
                      {degree.degreeName} ({degree.department})
                    </option>
                  ))}
                </select>
                {formErrors.degree && <p className="mt-1 text-xs text-red-600">{formErrors.degree}</p>}
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
                disabled={loading || (editStudent ? !canUpdate : !canCreate)}
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
