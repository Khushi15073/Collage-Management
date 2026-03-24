import { useState } from "react";
import { Pencil, Trash2, Mail, Phone, Search, Plus } from "lucide-react";

// ✅ TypeScript: shape of a Faculty member
type Faculty = {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  status: string;
};

// ✅ Fake data
const facultyList: Faculty[] = [
  { id: "FAC001", name: "Prof. Michael Chen",   email: "michael.chen@college.edu",   phone: "+1 234-567-9001", department: "Computer Science", specialization: "Artificial Intelligence",  status: "Active" },
  { id: "FAC002", name: "Dr. Sarah Johnson",    email: "sarah.johnson@college.edu",   phone: "+1 234-567-9002", department: "Mathematics",      specialization: "Applied Mathematics",      status: "Active" },
  { id: "FAC003", name: "Prof. Robert Taylor",  email: "robert.taylor@college.edu",   phone: "+1 234-567-9003", department: "Engineering",      specialization: "Mechanical Engineering",   status: "Active" },
  { id: "FAC004", name: "Dr. Emily White",      email: "emily.white@college.edu",     phone: "+1 234-567-9004", department: "Business",         specialization: "Marketing",                status: "Active" },
  { id: "FAC005", name: "Prof. David Lee",      email: "david.lee@college.edu",       phone: "+1 234-567-9005", department: "Physics",          specialization: "Quantum Mechanics",        status: "Inactive" },
];

// ✅ Empty form for Add Faculty
const emptyForm = {
  name: "",
  email: "",
  phone: "",
  department: "",
  specialization: "",
  status: "Active",
};

function ManageFaculty() {

  // ✅ All faculty members
  const [faculty, setFaculty] = useState<Faculty[]>(facultyList);

  // ✅ Search input value
  const [search, setSearch] = useState<string>("");

  // ✅ Show or hide the modal
  const [showModal, setShowModal] = useState<boolean>(false);

  // ✅ Which faculty is being edited (null = adding new)
  const [editFaculty, setEditFaculty] = useState<Faculty | null>(null);

  // ✅ Form field values
  const [form, setForm] = useState(emptyForm);

  // ─────────────────────────────────────────
  // Filter faculty by search input
  // ─────────────────────────────────────────
  const filteredFaculty = faculty.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.department.toLowerCase().includes(search.toLowerCase())
  );

  // ─────────────────────────────────────────
  // Open modal to Add new faculty
  // ─────────────────────────────────────────
  function openAddModal() {
    setEditFaculty(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  // ─────────────────────────────────────────
  // Open modal to Edit existing faculty
  // ─────────────────────────────────────────
  function openEditModal(f: Faculty) {
    setEditFaculty(f);
    setForm({
      name: f.name,
      email: f.email,
      phone: f.phone,
      department: f.department,
      specialization: f.specialization,
      status: f.status,
    });
    setShowModal(true);
  }

  // ─────────────────────────────────────────
  // Save: Add new or Update existing
  // ─────────────────────────────────────────
  function handleSave() {
    if (editFaculty) {
      // UPDATE existing faculty
      setFaculty(faculty.map((f) =>
        f.id === editFaculty.id ? { ...f, ...form } : f
      ));
    } else {
      // ADD new faculty with new ID
      const newId = "FAC" + String(faculty.length + 1).padStart(3, "0");
      const newFaculty: Faculty = { id: newId, ...form };
      setFaculty([...faculty, newFaculty]);
    }
    setShowModal(false);
  }

  // ─────────────────────────────────────────
  // Delete a faculty member by ID
  // ─────────────────────────────────────────
  function handleDelete(id: string) {
    const sure = window.confirm("Are you sure you want to delete this faculty member?");
    if (sure) {
      setFaculty(faculty.filter((f) => f.id !== id));
    }
  }

  // ─────────────────────────────────────────
  // Update form when user types
  // ─────────────────────────────────────────
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Faculty</h1>
          <p className="text-sm text-gray-400 mt-1">View and manage all faculty members</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          <Plus size={15} /> Add Faculty
        </button>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Card Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Faculty List</h2>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-56 bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">

            {/* Table Head */}
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Faculty ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Department</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Specialization</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="border-b border-gray-50 hover:bg-gray-50 transition">

                  {/* Faculty ID */}
                  <td className="px-6 py-4 font-bold text-gray-800">{f.id}</td>

                  {/* Name */}
                  <td className="px-6 py-4 text-gray-700 font-medium">{f.name}</td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                      <Mail size={11} className="text-gray-400" /> {f.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone size={11} className="text-gray-400" /> {f.phone}
                    </div>
                  </td>

                  {/* Department */}
                  <td className="px-6 py-4 text-gray-600">{f.department}</td>

                  {/* Specialization */}
                  <td className="px-6 py-4 text-gray-600">{f.specialization}</td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      f.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {f.status}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(f)}
                        className="text-gray-400 hover:text-blue-600 transition"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {/* No results */}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm">
                    No faculty members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Showing {filteredFaculty.length} of {faculty.length} faculty members
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">

            <h2 className="text-lg font-bold text-gray-800 mb-1">
              {editFaculty ? "Edit Faculty" : "Add New Faculty"}
            </h2>
            <p className="text-xs text-gray-400 mb-5">
              {editFaculty ? `Editing record for ${editFaculty.id}` : "Fill in the details below"}
            </p>

            {/* Form Fields */}
            <div className="grid grid-cols-2 gap-4">

              {/* Full Name - full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Dr. John Smith"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email - full width */}
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="e.g. john@college.edu"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleFormChange}
                  placeholder="+1 234-567-0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Department */}
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

              {/* Specialization */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Specialization</label>
                <input
                  name="specialization"
                  value={form.specialization}
                  onChange={handleFormChange}
                  placeholder="e.g. Machine Learning"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 bg-gray-900 hover:bg-gray-700 text-white rounded-lg py-2.5 text-sm font-semibold transition"
              >
                {editFaculty ? "Save Changes" : "Add Faculty"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageFaculty;