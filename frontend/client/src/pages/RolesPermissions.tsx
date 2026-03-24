import { useState } from "react";
import { Shield, Check } from "lucide-react";

// ✅ Shape of one permission item
type Permission = {
  id: string;
  label: string;
  description: string;
};

// ✅ Shape of a permission section (Students, Faculty, etc.)
type PermissionGroup = {
  section: string;
  permissions: Permission[];
};

// ✅ All permission sections
const permissionGroups: PermissionGroup[] = [
  {
    section: "Students",
    permissions: [
      { id: "create_students",    label: "Create Students",    description: "Add new student records"      },
      { id: "view_students",      label: "View Students",      description: "View student information"     },
      { id: "update_students",    label: "Update Students",    description: "Edit student records"         },
      { id: "delete_students",    label: "Delete Students",    description: "Remove student records"       },
    ],
  },
  {
    section: "Faculty",
    permissions: [
      { id: "create_faculty",     label: "Create Faculty",     description: "Add new faculty members"      },
      { id: "view_faculty",       label: "View Faculty",       description: "View faculty information"     },
      { id: "update_faculty",     label: "Update Faculty",     description: "Edit faculty records"         },
      { id: "delete_faculty",     label: "Delete Faculty",     description: "Remove faculty records"       },
    ],
  },
  {
    section: "Courses",
    permissions: [
      { id: "create_courses",     label: "Create Courses",     description: "Add new courses"              },
      { id: "view_courses",       label: "View Courses",       description: "View course information"      },
      { id: "update_courses",     label: "Update Courses",     description: "Edit course details"          },
      { id: "delete_courses",     label: "Delete Courses",     description: "Remove courses"               },
    ],
  },
  {
    section: "Attendance",
    permissions: [
      { id: "mark_attendance",    label: "Mark Attendance",    description: "Record student attendance"    },
      { id: "view_attendance",    label: "View Attendance",    description: "View attendance records"      },
      { id: "edit_attendance",    label: "Edit Attendance",    description: "Modify attendance records"    },
    ],
  },
  {
    section: "Assignments",
    permissions: [
      { id: "create_assignments", label: "Create Assignments", description: "Create new assignments"       },
      { id: "view_assignments",   label: "View Assignments",   description: "View assignments"             },
      { id: "grade_assignments",  label: "Grade Assignments",  description: "Grade student submissions"    },
      { id: "delete_assignments", label: "Delete Assignments", description: "Remove assignments"           },
    ],
  },
  {
    section: "Reports",
    permissions: [
      { id: "view_reports",       label: "View Reports",       description: "View generated reports"       },
      { id: "create_reports",     label: "Create Reports",     description: "Generate new reports"         },
      { id: "export_reports",     label: "Export Reports",     description: "Export reports to file"       },
    ],
  },
];

// ✅ Get all permission IDs in a flat list
const allIds = permissionGroups.flatMap((g) => g.permissions.map((p) => p.id));

// ✅ Default ON permissions per role
const defaultPermissions: Record<string, Record<string, boolean>> = {
  // Admin: everything ON
  Admin: Object.fromEntries(allIds.map((id) => [id, true])),

  // Faculty: can view most things + mark attendance + grade
  Faculty: Object.fromEntries(
    allIds.map((id) => [
      id,
      ["view_students", "view_faculty", "view_courses",
       "mark_attendance", "view_attendance",
       "view_assignments", "grade_assignments",
       "view_reports"].includes(id),
    ])
  ),

  // Student: can only view courses, attendance, assignments
  Student: Object.fromEntries(
    allIds.map((id) => [
      id,
      ["view_courses", "view_attendance", "view_assignments"].includes(id),
    ])
  ),
};

function RolesPermissions() {

  // ✅ Which role tab is active
  const [activeRole, setActiveRole] = useState<string>("Admin");

  // ✅ Permissions state for all 3 roles
  const [permissions, setPermissions] = useState(defaultPermissions);

  // ✅ Show/hide saved toast
  const [saved, setSaved] = useState<boolean>(false);

  // ─────────────────────────────────────────
  // Toggle one permission ON or OFF
  // ─────────────────────────────────────────
  function togglePermission(permId: string) {
    setPermissions((prev) => ({
      ...prev,
      [activeRole]: {
        ...prev[activeRole],
        [permId]: !prev[activeRole][permId],
      },
    }));
  }

  // ─────────────────────────────────────────
  // Count how many permissions are ON
  // ─────────────────────────────────────────
  function countOn(role: string) {
    return Object.values(permissions[role]).filter(Boolean).length;
  }

  // ─────────────────────────────────────────
  // Handle Save button
  // ─────────────────────────────────────────
  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role & Permissions</h1>
          <p className="text-sm text-gray-400 mt-1">Manage access control for different user roles</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-gray-900 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition"
        >
          <Check size={15} /> Save Changes
        </button>
      </div>

      {/* ── Success Toast ── */}
      {saved && (
        <div className="fixed top-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-semibold z-50 flex items-center gap-2">
          <Check size={15} /> Changes saved successfully!
        </div>
      )}

      {/* ── 3 Role Stat Cards ── */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Admin Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Admin</p>
            <p className="text-3xl font-bold text-gray-900">{countOn("Admin")}</p>
            <p className="text-xs text-gray-400">permissions</p>
          </div>
        </div>

        {/* Faculty Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Faculty</p>
            <p className="text-3xl font-bold text-gray-900">{countOn("Faculty")}</p>
            <p className="text-xs text-gray-400">permissions</p>
          </div>
        </div>

        {/* Student Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-gray-400">Student</p>
            <p className="text-3xl font-bold text-gray-900">{countOn("Student")}</p>
            <p className="text-xs text-gray-400">permissions</p>
          </div>
        </div>

      </div>

      {/* ── Configure Permissions Card ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">

        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Configure Permissions</h2>
          <p className="text-sm text-gray-400 mt-0.5">Enable or disable permissions for each role</p>
        </div>

        {/* ── Role Tabs ── */}
        <div className="px-6 pt-5">
          <div className="flex bg-gray-100 rounded-xl p-1">
            {["Admin", "Faculty", "Student"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activeRole === role
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* ── Permission Sections ── */}
        <div className="px-6 py-5 space-y-7">
          {permissionGroups.map((group) => (
            <div key={group.section}>

              {/* Section Heading */}
              <h3 className="text-base font-bold text-gray-800 mb-3">{group.section}</h3>

              {/* Permission Toggle Rows */}
              <div className="space-y-2">
                {group.permissions.map((perm) => {
                  const isOn = permissions[activeRole][perm.id];

                  return (
                    <div
                      key={perm.id}
                      className="flex items-center justify-between border border-gray-100 rounded-xl px-5 py-4 hover:bg-gray-50 transition"
                    >
                      {/* Text */}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{perm.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        onClick={() => togglePermission(perm.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
                          isOn ? "bg-gray-900" : "bg-gray-200"
                        }`}
                      >
                        {/* Sliding circle */}
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                            isOn ? "translate-x-6" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default RolesPermissions;