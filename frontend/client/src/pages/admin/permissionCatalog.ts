export type PermissionCatalogItem = {
  key: string;
  label: string;
  description: string;
};

export type PermissionGroup = {
  section: string;
  permissions: PermissionCatalogItem[];
};

export const permissionGroups: PermissionGroup[] = [
  {
    section: "Students",
    permissions: [
      { key: "create_students", label: "Create Students", description: "Add new student records" },
      { key: "view_students", label: "View Students", description: "View student information" },
      { key: "update_students", label: "Update Students", description: "Edit student records" },
      { key: "delete_students", label: "Delete Students", description: "Remove student records" },
    ],
  },
  {
    section: "Faculty",
    permissions: [
      { key: "create_faculty", label: "Create Faculty", description: "Add new faculty members" },
      { key: "view_faculty", label: "View Faculty", description: "View faculty information" },
      { key: "update_faculty", label: "Update Faculty", description: "Edit faculty records" },
      { key: "delete_faculty", label: "Delete Faculty", description: "Remove faculty records" },
    ],
  },
  {
    section: "Courses",
    permissions: [
      { key: "create_courses", label: "Create Courses", description: "Add new courses" },
      { key: "view_courses", label: "View Courses", description: "View course information" },
      { key: "update_courses", label: "Update Courses", description: "Edit course details" },
      { key: "delete_courses", label: "Delete Courses", description: "Remove courses" },
    ],
  },
  {
    section: "Attendance",
    permissions: [
      { key: "mark_attendance", label: "Mark Attendance", description: "Record student attendance" },
      { key: "view_attendance", label: "View Attendance", description: "View attendance records" },
      { key: "edit_attendance", label: "Edit Attendance", description: "Modify attendance records" },
    ],
  },
  {
    section: "Assignments",
    permissions: [
      { key: "create_assignments", label: "Create Assignments", description: "Create new assignments" },
      { key: "view_assignments", label: "View Assignments", description: "View assignments" },
      { key: "grade_assignments", label: "Grade Assignments", description: "Grade student submissions" },
      { key: "delete_assignments", label: "Delete Assignments", description: "Remove assignments" },
    ],
  },
  {
    section: "Reports",
    permissions: [
      { key: "view_reports", label: "View Reports", description: "View generated reports" },
      { key: "create_reports", label: "Create Reports", description: "Generate new reports" },
      { key: "export_reports", label: "Export Reports", description: "Export reports to file" },
    ],
  },
];

export const permissionCatalog = permissionGroups.flatMap((group) => group.permissions);
