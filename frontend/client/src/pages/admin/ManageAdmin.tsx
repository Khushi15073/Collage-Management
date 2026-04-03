import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Phone, Plus, Shield, Trash2, UserCog } from "lucide-react";
import {
  clearAdminError,
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  setAdminPage,
  setAdminRole,
  updateAdmin,
} from "../../features/adminSlice";
import type { AdminUser } from "../../features/adminSlice";
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
  password: "",
  phoneNumber: "",
  gender: "male" as "male" | "female" | "other",
  role: "",
};

type FormErrors = Partial<Record<keyof typeof emptyForm, string>>;

function ManageAdmin() {
  const dispatch = useDispatch();
  const { searchQuery } = useDashboardSearch();

  const admins = useSelector((state: any) => state.admins.admins);
  const loading = useSelector((state: any) => state.admins.loading);
  const error = useSelector((state: any) => state.admins.error);
  const currentPage = useSelector((state: any) => state.admins.currentPage);
  const limit = useSelector((state: any) => state.admins.limit);
  const totalItems = useSelector((state: any) => state.admins.totalItems);
  const totalPages = useSelector((state: any) => state.admins.totalPages);
  const selectedRoleName = useSelector((state: any) => state.admins.role);
  const roles = useSelector((state: any) => state.roles.roles);
  const rolesLoading = useSelector((state: any) => state.roles.loading);
  const roleError = useSelector((state: any) => state.roles.error);
  const user = useSelector((state: any) => state.auth.user);

  const [showModal, setShowModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState<AdminUser | null>(null);
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

  const manageableRoles = useMemo(
    () => roles.filter((role: any) => role.name !== "student" && role.name !== "faculty"),
    [roles]
  );

  const selectedRole = useMemo(() => {
    return manageableRoles.find((role: any) => role.name === selectedRoleName) || null;
  }, [manageableRoles, selectedRoleName]);

  useEffect(() => {
    if (manageableRoles.length === 0) {
      return;
    }

    const hasSelectedRole = manageableRoles.some((role: any) => role.name === selectedRoleName);
    if (!selectedRoleName || !hasSelectedRole) {
      dispatch(setAdminRole(manageableRoles[0].name));
    }
  }, [dispatch, manageableRoles, selectedRoleName]);

  useEffect(() => {
    if (!selectedRoleName) {
      return;
    }

    if (previousSearchRef.current !== debouncedSearch) {
      previousSearchRef.current = debouncedSearch;

      if (currentPage !== 1) {
        dispatch(setAdminPage(1));
        return;
      }
    }

    dispatch(
      fetchAdmins({
        page: currentPage,
        limit,
        search: debouncedSearch,
        role: selectedRoleName,
      }) as any
    );
  }, [currentPage, debouncedSearch, dispatch, limit, selectedRoleName]);

  function openAddModal() {
    setEditAdmin(null);
    setForm({
      ...emptyForm,
      role: selectedRole?._id || "",
    });
    setEmailNotice(null);
    setFormErrors({});
    dispatch(clearAdminError());
    setShowModal(true);
  }

  function openEditModal(admin: AdminUser) {
    setEditAdmin(admin);
    setForm({
      name: admin.name,
      email: admin.email,
      password: "",
      phoneNumber: admin.phoneNumber,
      gender: admin.gender,
      role: admin.role?._id || selectedRole?._id || "",
    });
    setFormErrors({});
    dispatch(clearAdminError());
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditAdmin(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  async function handleSave() {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.phoneNumber.trim()) nextErrors.phoneNumber = "Phone number is required.";
    if (!form.role) nextErrors.role = "Role is required.";
    if (!editAdmin && !form.password.trim()) nextErrors.password = "Password is required.";

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    if (editAdmin) {
      const result = await dispatch(
        updateAdmin({
          id: editAdmin._id,
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          gender: form.gender,
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        }) as any
      );

      if (updateAdmin.fulfilled.match(result)) {
        dispatch(fetchAdmins({ page: currentPage, limit, search: debouncedSearch, role: selectedRoleName }) as any);
        closeModal();
      }
      return;
    }

    const result = await dispatch(
      createAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phoneNumber,
        gender: form.gender,
        role: form.role,
      }) as any
    );

    if (createAdmin.fulfilled.match(result)) {
      setEmailNotice({
        sent: result.payload.emailSent,
        message: result.payload.emailSent
          ? `Credentials were emailed to ${form.email}.`
          : result.payload.emailError || "User created, but email could not be sent.",
      });
      dispatch(setAdminPage(1));
      dispatch(fetchAdmins({ page: 1, limit, search: debouncedSearch, role: selectedRoleName }) as any);
      closeModal();
    }
  }

  async function handleDelete(id: string) {
    const sure = window.confirm("Are you sure you want to delete this user?");
    if (!sure) return;
    const result = await dispatch(deleteAdmin(id) as any);

    if (deleteAdmin.fulfilled.match(result)) {
      const nextPage = admins.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
      dispatch(setAdminPage(nextPage));
    }
  }

  const pageError = error || roleError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";
  const startIndex = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endIndex = totalItems === 0 ? 0 : startIndex + admins.length - 1;
  const canPreviousPage = currentPage > 1;
  const canNextPage = totalPages > 0 && currentPage < totalPages;
  const canCreate = hasPermission(user, "create_admins");
  const canUpdate = hasPermission(user, "update_admins");
  const canDelete = hasPermission(user, "delete_admins");

  function handleFieldChange<K extends keyof typeof emptyForm>(field: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setFormErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
    if (error) dispatch(clearAdminError());
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Role Users</h1>
          <p className="mt-1 text-sm text-gray-400">Create and manage admin and custom-role accounts</p>
        </div>
        <button
          onClick={openAddModal}
          disabled={!canCreate}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          <Plus size={15} /> Add User
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
            <h2 className="text-base font-semibold text-gray-800">
              {selectedRole ? `${selectedRole.name.charAt(0).toUpperCase() + selectedRole.name.slice(1)} Directory` : "Role Directory"}
            </h2>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-500">
            <span>Role</span>
            <select
              value={selectedRoleName}
              onChange={(event) => dispatch(setAdminRole(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {manageableRoles.map((role: any) => (
                <option key={role._id} value={role.name}>
                  {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <TableContainer className="min-h-0 flex-1 overflow-auto">
          {loading && admins.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading users...</div>
          ) : (
            <Table>
              <TableHead>
                <TableRow className="border-b border-gray-100 bg-gray-50">
                  <TableHeader>User</TableHeader>
                  <TableHeader>Contact</TableHeader>
                  <TableHeader>Gender</TableHeader>
                  <TableHeader>Role</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {admins.map((admin: AdminUser) => (
                  <TableRow key={admin._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <TableCell>
                      <div className="font-medium text-gray-800">{admin.name}</div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Shield size={11} />
                        Elevated account
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-gray-400" /> {admin.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" /> {admin.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-gray-600">{admin.gender}</TableCell>
                    <TableCell>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold capitalize text-amber-700">
                        {admin.role?.name || selectedRoleName}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(admin)}
                          disabled={!canUpdate}
                          className="text-gray-400 transition hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <UserCog size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(admin._id)}
                          disabled={!canDelete}
                          className="text-gray-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {admins.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-gray-400">
                      {pageError ? "Unable to load users." : "No users found for this role."}
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
          itemLabel="users"
          onPageChange={(page) => dispatch(setAdminPage(page))}
          onPrevious={() => dispatch(setAdminPage(currentPage - 1))}
          onNext={() => dispatch(setAdminPage(currentPage + 1))}
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
                  {editAdmin ? "Edit User" : "Add User"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {editAdmin ? "Update the account details below" : "Create a new account for the selected role"}
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
                  value={form.name}
                  onChange={(event) => handleFieldChange("name", event.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter user name"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => handleFieldChange("email", event.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter user email"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-600">{formErrors.email}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editAdmin ? "New Password" : "Password"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => handleFieldChange("password", event.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.password ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder={editAdmin ? "Leave blank to keep current" : "Enter password"}
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-600">{formErrors.password}</p>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  value={form.phoneNumber}
                  onChange={(event) => handleFieldChange("phoneNumber", event.target.value)}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.phoneNumber ? "border-red-300" : "border-gray-200"
                  }`}
                  placeholder="Enter phone number"
                />
                {formErrors.phoneNumber && <p className="mt-1 text-xs text-red-600">{formErrors.phoneNumber}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                <select
                  value={form.role}
                  onChange={(event) => handleFieldChange("role", event.target.value)}
                  disabled={rolesLoading}
                  className={`w-full rounded-lg border bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60 ${
                    formErrors.role ? "border-red-300" : "border-gray-200"
                  }`}
                >
                  <option value="">{rolesLoading ? "Loading roles..." : "Select role"}</option>
                  {manageableRoles.map((role: any) => (
                    <option key={role._id} value={role._id}>
                      {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                    </option>
                  ))}
                </select>
                {formErrors.role && <p className="mt-1 text-xs text-red-600">{formErrors.role}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      gender: event.target.value as "male" | "female" | "other",
                    }))
                  }
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Users created here can belong to admin or any custom role from the database.
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
                disabled={loading || rolesLoading || !form.role || (editAdmin ? !canUpdate : !canCreate)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Saving..." : editAdmin ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {emailNotice && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
          <div className="mb-3 flex items-start justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">User Created</h3>
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
              emailNotice.sent ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {emailNotice.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageAdmin;
