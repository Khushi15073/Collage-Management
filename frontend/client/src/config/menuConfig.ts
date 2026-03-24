export const menuConfig = [
  { name: "Dashboard", path: "/admin", roles: ["admin", "faculty", "student"] },
  { name: "Manage Students", path: "/admin/students", roles: ["admin"] },
  { name: "Manage Faculty", path: "/admin/faculty", roles: ["admin"] },
  { name: "Manage Courses", path: "/admin/courses", roles: ["admin", "faculty"] },
  { name: "Roles & Permissions", path: "/admin/roles", roles: ["admin"] },
  { name: "Reports", path: "/admin/reports", roles: ["admin"] },
];