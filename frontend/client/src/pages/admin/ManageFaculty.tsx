import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Mail, Phone, Plus } from "lucide-react";
import {
  clearFacultyError,
  createFaculty,
  deleteFaculty,
  fetchFaculty,
  setFacultyPage,
  updateFaculty,
} from "../../features/facultySlice";
import type { Faculty } from "../../features/facultySlice";
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
import { hasPermission } from "../../access/appAccess";

const emptyForm = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "male" as "male" | "female" | "other",
  role: "",
  password: "",
};

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>;

function ManageFaculty() {
  const dispatch = useDispatch();
  const { searchQuery } = useDashboardSearch();

  const faculty = useSelector((state: any) => state.faculty.faculty);
  const loading = useSelector((state: any) => state.faculty.loading);
  const error = useSelector((state: any) => state.faculty.error);
  const currentPage = useSelector((state: any) => state.faculty.currentPage);
  const limit = useSelector((state: any) => state.faculty.limit);
  const totalItems = useSelector((state: any) => state.faculty.totalItems);
  const totalPages = useSelector((state: any) => state.faculty.totalPages);

  const roles = useSelector((state: any) => state.roles.roles);
  const rolesLoading = useSelector((state: any) => state.roles.loading);
  const roleError = useSelector((state: any) => state.roles.error);
  const user = useSelector((state: any) => state.auth.user);

  const [showModal, setShowModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
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
        dispatch(setFacultyPage(1));
        return;
      }
    }

    dispatch(
      fetchFaculty({
        page: currentPage,
        limit,
        search: debouncedSearch,
      }) as any
    );
  }, [currentPage, debouncedSearch, dispatch, limit]);

  const facultyRoleId = useMemo(() => {
    const facultyRole = roles.find((role: any) => role.name === "faculty");
    return facultyRole?._id || "";
  }, [roles]);

  function resetForm(roleId?: string) {
    setForm({
      ...emptyForm,
      role: roleId || facultyRoleId,
    });
    setFormErrors({});
  }

  function openAddModal() {
    setEditFaculty(null);
    resetForm();
    setEmailNotice(null);
    dispatch(clearFacultyError());
    setShowModal(true);
  }

  function openEditModal(item: Faculty) {
    setEditFaculty(item);
    setForm({
      name: item.name,
      email: item.email,
      phoneNumber: item.phoneNumber,
      gender: item.gender,
      role: item.role?._id || facultyRoleId,
      password: "",
    });
    dispatch(clearFacultyError());
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditFaculty(null);
    resetForm();
  }

  async function handleSave() {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!form.role) nextErrors.role = "Role is required.";
    if (editFaculty == null && !form.password.trim()) nextErrors.password = "Password is required.";

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (editFaculty) {
      const result = await dispatch(
        updateFaculty({
          id: editFaculty._id,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          role: form.role,
          password: form.password,
        }) as any
      );

      if (updateFaculty.fulfilled.match(result)) {
        dispatch(
          fetchFaculty({
            page: currentPage,
            limit,
            search: debouncedSearch,
          }) as any
        );
        closeModal();
      }
      return;
    }

    const result = await dispatch(
      createFaculty({
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        role: form.role,
      }) as any
    );

    if (createFaculty.fulfilled.match(result)) {
      setEmailNotice({
        sent: result.payload.emailSent,
        message: result.payload.emailSent
          ? `Credentials were emailed to ${form.email}.`
          : result.payload.emailError || "Faculty created, but email could not be sent.",
      });
      dispatch(setFacultyPage(1));
      dispatch(
        fetchFaculty({
          page: 1,
          limit,
          search: debouncedSearch,
        }) as any
      );
      closeModal();
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this faculty member?");
    if (confirmed === false) {
      return;
    }

    const result = await dispatch(deleteFaculty(id) as any);

    if (deleteFaculty.fulfilled.match(result)) {
      const nextPage = faculty.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      dispatch(setFacultyPage(nextPage));
    }
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
    setFormErrors((current) => {
      if (!current[event.target.name as keyof typeof emptyForm]) return current;
      const next = { ...current };
      delete next[event.target.name as keyof typeof emptyForm];
      return next;
    });

    if (error) {
      dispatch(clearFacultyError());
    }
  }

  const pageError = error || roleError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + faculty.length - 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = totalPages > 0 && currentPage < totalPages;
  const canCreate = hasPermission(user, "create_faculty");
  const canUpdate = hasPermission(user, "update_faculty");
  const canDelete = hasPermission(user, "delete_faculty");

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
          <p className="mt-1 text-sm text-gray-400">View and manage all faculty members</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!canCreate}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Plus size={15} /> Add Faculty
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
            <h2 className="text-base font-semibold text-gray-800">Faculty List</h2>
          </div>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          {loading && faculty.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading faculty...</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow className="border-b border-gray-100 bg-gray-50">
                  <TableHeader>Name</TableHeader>
                  <TableHeader>Contact</TableHeader>
                  <TableHeader>Gender</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {faculty.map((item: Faculty) => (
                  <TableRow key={item._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-800">{item.name}</TableCell>
                    <TableCell>
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-gray-400" /> {item.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" /> {item.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-gray-600">{item.gender}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {item.role?.name || "faculty"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          disabled={!canUpdate}
                          className="text-gray-400 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={!canDelete}
                          className="text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {faculty.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      {pageError ? "Unable to load faculty members." : "No faculty members found."}
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
          itemLabel="faculty members"
          onPageChange={(page) => dispatch(setFacultyPage(page))}
          onPrevious={() => dispatch(setFacultyPage(currentPage - 1))}
          onNext={() => dispatch(setFacultyPage(currentPage + 1))}
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
                  {editFaculty ? "Edit Faculty" : "Add New Faculty"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {editFaculty
                    ? "Update faculty details below"
                    : "Create a faculty account and share the generated credentials"}
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
                <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="Enter faculty name"
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-200"
                  }`}
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
                  placeholder="faculty@college.edu"
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.phoneNumber ? "border-red-300" : "border-gray-200"
                  }`}
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
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editFaculty ? "New Password" : "Password"}
                </label>
                <input
                  name="password"
                  type="text"
                  value={form.password}
                  onChange={handleFormChange}
                  placeholder={editFaculty ? "Leave blank to keep current" : "Enter a password"}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password ? "border-red-300" : "border-gray-200"
                  }`}
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || (editFaculty ? !canUpdate : !canCreate)}
                className="flex-1 rounded-lg bg-gray-900 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : editFaculty ? "Save Changes" : "Add Faculty"}
              </button>
            </div>
          </div>
        </div>
      )}

      {emailNotice && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Faculty Created</h3>
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

export default ManageFaculty;
