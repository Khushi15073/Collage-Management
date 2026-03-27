import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Pencil, Trash2, Mail, Phone, Search, Plus, RefreshCw, KeyRound } from "lucide-react";
import {
  clearFacultyError,
  createFaculty,
  deleteFaculty,
  fetchFaculty,
  updateFaculty,
} from "../../features/facultySlice";
import type { Faculty } from "../../features/facultySlice";
import { fetchRoles } from "../../features/roleSlice";

const emptyForm = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "male" as "male" | "female" | "other",
  role: "",
  password: "",
};

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
  let value = "";

  for (let index = 0; index < 12; index += 1) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    value += alphabet[randomIndex];
  }

  return value;
}

function ManageFaculty() {
  const dispatch = useDispatch();

  const faculty = useSelector((state: any) => state.faculty.faculty);
  const loading = useSelector((state: any) => state.faculty.loading);
  const error = useSelector((state: any) => state.faculty.error);

  const roles = useSelector((state: any) => state.roles.roles);
  const rolesLoading = useSelector((state: any) => state.roles.loading);
  const roleError = useSelector((state: any) => state.roles.error);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [emailNotice, setEmailNotice] = useState<{ sent: boolean; message: string } | null>(null);

  useEffect(() => {
    dispatch(fetchFaculty() as any);
    if (roles.length === 0) {
      dispatch(fetchRoles() as any);
    }
  }, []);

  const facultyRoleId = useMemo(() => {
    const facultyRole = roles.find((role: any) => role.name === "faculty");
    return facultyRole?._id || "";
  }, [roles]);

  function resetForm(roleId?: string) {
    setForm({
      ...emptyForm,
      role: roleId || facultyRoleId,
    });
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

  function handleGeneratePassword() {
    setForm((current) => ({
      ...current,
      password: generatePassword(),
    }));
  }

  async function handleSave() {
    if (
      form.name === "" ||
      form.email === "" ||
      form.phoneNumber === "" ||
      form.role === ""
    ) {
      return;
    }

    if (editFaculty == null && form.password === "") {
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
      closeModal();
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this faculty member?");
    if (confirmed === false) {
      return;
    }

    dispatch(deleteFaculty(id) as any);
  }

  function handleFormChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });

    if (error) {
      dispatch(clearFacultyError());
    }
  }

  const filteredFaculty = faculty.filter((item: Faculty) => {
    const query = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.phoneNumber.toLowerCase().includes(query)
    );
  });

  const pageError = error || roleError;
  const isSessionError =
    pageError === "Session expired. Please log in again." ||
    pageError === "Unauthorized" ||
    pageError === "Invalid token";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
          <p className="mt-1 text-sm text-gray-400">View and manage all faculty members</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700"
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

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-800">Faculty List</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-56 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading && faculty.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading faculty...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFaculty.map((item: Faculty) => (
                  <tr key={item._id} className="border-b border-gray-50 transition hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                    <td className="px-6 py-4">
                      <div className="mb-1 flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail size={11} className="text-gray-400" /> {item.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Phone size={11} className="text-gray-400" /> {item.phoneNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-600">{item.gender}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                        {item.role?.name || "faculty"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(item)}
                          className="text-gray-400 transition hover:text-blue-600"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="text-gray-400 transition hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredFaculty.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">
                      {pageError ? "Unable to load faculty members." : "No faculty members found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-400">
          Showing {filteredFaculty.length} of {faculty.length} faculty members
        </div>
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
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="faculty@college.edu"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone Number</label>
                <input
                  name="phoneNumber"
                  value={form.phoneNumber}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {editFaculty ? "New Password" : "Password"}
                </label>
                <div className="flex gap-2">
                  <input
                    name="password"
                    type="text"
                    value={form.password}
                    onChange={handleFormChange}
                    placeholder={editFaculty ? "Leave blank to keep current" : "Generate or enter a password"}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                  >
                    <RefreshCw size={14} /> Generate
                  </button>
                </div>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <KeyRound size={12} />
                  The generated password will be emailed to the faculty member after creation.
                </p>
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
                disabled={loading}
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
