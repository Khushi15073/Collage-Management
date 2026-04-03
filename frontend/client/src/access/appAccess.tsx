import {
  BookOpen,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";
import type { ComponentType } from "react";

export type AuthUser = {
  _id?: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
};

export type AppNavItem = {
  label: string;
  path: string;
  layout: "admin" | "faculty" | "student";
  icon: ComponentType<{ className?: string; size?: number }>;
  requiredPermissions?: string[];
  allowedRoles?: string[];
};

export const ADMIN_PANEL_PERMISSIONS = [
  "view_admins",
  "create_admins",
  "update_admins",
  "delete_admins",
  "view_students",
  "create_students",
  "update_students",
  "delete_students",
  "view_faculty",
  "create_faculty",
  "update_faculty",
  "delete_faculty",
  "view_courses",
  "create_courses",
  "update_courses",
  "delete_courses",
  "view_degrees",
  "create_degrees",
  "update_degrees",
  "delete_degrees",
  "view_attendance",
  "view_permissions",
  "create_permissions",
  "update_permissions",
  "delete_permissions",
];

export const APP_NAV_ITEMS: AppNavItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    layout: "admin",
    icon: LayoutDashboard,
    allowedRoles: ["admin"],
  },
  {
    label: "Manage Role Users",
    path: "/admins",
    layout: "admin",
    icon: UsersRound,
    requiredPermissions: ["view_admins"],
  },
  {
    label: "Manage Students",
    path: "/students",
    layout: "admin",
    icon: Users,
    requiredPermissions: ["view_students"],
  },
  {
    label: "Manage Faculty",
    path: "/faculty",
    layout: "admin",
    icon: UsersRound,
    requiredPermissions: ["view_faculty"],
  },
  {
    label: "Manage Courses",
    path: "/courses",
    layout: "admin",
    icon: BookOpen,
    requiredPermissions: ["view_courses"],
  },
  {
    label: "Manage Degrees",
    path: "/degrees",
    layout: "admin",
    icon: GraduationCap,
    requiredPermissions: ["view_degrees"],
  },
  {
    label: "Roles & Permissions",
    path: "/roles",
    layout: "admin",
    icon: Settings,
    requiredPermissions: ["view_permissions"],
  },
  {
    label: "Help & Guide",
    path: "/help",
    layout: "admin",
    icon: HelpCircle,
    allowedRoles: ["admin"],
  },
  {
    label: "Dashboard",
    path: "/faculty/dashboard",
    layout: "faculty",
    icon: LayoutDashboard,
    allowedRoles: ["faculty"],
  },
  {
    label: "My Classes",
    path: "/faculty/classes",
    layout: "faculty",
    icon: BookOpen,
    allowedRoles: ["faculty"],
  },
  {
    label: "Student List",
    path: "/faculty/students",
    layout: "faculty",
    icon: GraduationCap,
    allowedRoles: ["faculty"],
  },
  {
    label: "Mark Attendance",
    path: "/faculty/attendance",
    layout: "faculty",
    icon: ListChecks,
    allowedRoles: ["faculty"],
  },
  {
    label: "Help & Guide",
    path: "/faculty/help",
    layout: "faculty",
    icon: HelpCircle,
    allowedRoles: ["faculty"],
  },
  {
    label: "Dashboard",
    path: "/student/dashboard",
    layout: "student",
    icon: LayoutDashboard,
    allowedRoles: ["student"],
  },
  {
    label: "My Courses",
    path: "/student/courses",
    layout: "student",
    icon: BookOpen,
    allowedRoles: ["student"],
  },
  {
    label: "My Attendance",
    path: "/student/attendance",
    layout: "student",
    icon: ListChecks,
    allowedRoles: ["student"],
  },
  {
    label: "Help & Guide",
    path: "/student/help",
    layout: "student",
    icon: HelpCircle,
    allowedRoles: ["student"],
  },
];

export function getUserRoleName(user: AuthUser | null | undefined) {
  return user?.role || "";
}

export function isAdminLikeRole(user: AuthUser | null | undefined) {
  const roleName = getUserRoleName(user);
  return roleName !== "" && roleName !== "faculty" && roleName !== "student";
}

export function formatRoleName(roleName: string) {
  return roleName
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissionNames?: string[]
) {
  if (user?.role === "admin") {
    return true;
  }

  if (!permissionNames || permissionNames.length === 0) {
    return true;
  }

  const grantedPermissions = new Set(user?.permissions || []);
  return permissionNames.some((permissionName) => grantedPermissions.has(permissionName));
}

export function hasPermission(
  user: AuthUser | null | undefined,
  permissionName: string
) {
  return hasAnyPermission(user, [permissionName]);
}

export function canAccessNavItem(user: AuthUser | null | undefined, item: AppNavItem) {
  const roleName = getUserRoleName(user);

  if (item.allowedRoles && item.allowedRoles.includes(roleName) === false) {
    return false;
  }

  return hasAnyPermission(user, item.requiredPermissions);
}

export function getVisibleNavItems(
  user: AuthUser | null | undefined,
  layout: AppNavItem["layout"]
) {
  return APP_NAV_ITEMS.filter((item) => item.layout === layout && canAccessNavItem(user, item));
}

export function getLandingPath(user: AuthUser | null | undefined) {
  const roleName = getUserRoleName(user);

  if (roleName === "faculty") {
    return "/faculty/dashboard";
  }

  if (roleName === "student") {
    return "/student/dashboard";
  }

  if (roleName === "admin" && canAccessPath(user, "/admin/dashboard")) {
    return "/admin/dashboard";
  }

  const adminItems = getVisibleNavItems(user, "admin").filter(
    (item) => item.path !== "/admin/dashboard" && item.path !== "/help"
  );
  return adminItems[0]?.path || "/help";
}

export function canAccessPath(user: AuthUser | null | undefined, path: string) {
  const route = APP_NAV_ITEMS.find((item) => item.path === path);
  if (!route) {
    return true;
  }

  return canAccessNavItem(user, route);
}
