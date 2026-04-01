"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_PERMISSIONS = exports.DEFAULT_PERMISSION_GROUPS = exports.SYSTEM_ROLES = void 0;
exports.getPermissionDefinition = getPermissionDefinition;
exports.formatPermissionLabel = formatPermissionLabel;
exports.SYSTEM_ROLES = [
    {
        name: "admin",
        description: "Full access to all features",
    },
    {
        name: "faculty",
        description: "Access to manage students and courses",
    },
    {
        name: "student",
        description: "Access to view courses and results",
    },
];
exports.DEFAULT_PERMISSION_GROUPS = [
    {
        section: "Admins",
        permissions: [
            {
                key: "view_admins",
                label: "View Admins",
                description: "View admin accounts",
            },
            {
                key: "create_admins",
                label: "Create Admins",
                description: "Allow admins to create other admin accounts",
            },
            {
                key: "update_admins",
                label: "Update Admins",
                description: "Edit admin accounts",
            },
            {
                key: "delete_admins",
                label: "Delete Admins",
                description: "Remove admin accounts",
            },
        ],
    },
    {
        section: "Students",
        permissions: [
            {
                key: "create_students",
                label: "Create Students",
                description: "Add new student records",
            },
            {
                key: "view_students",
                label: "View Students",
                description: "View student information",
            },
            {
                key: "update_students",
                label: "Update Students",
                description: "Edit student records",
            },
            {
                key: "delete_students",
                label: "Delete Students",
                description: "Remove student records",
            },
        ],
    },
    {
        section: "Faculty",
        permissions: [
            {
                key: "create_faculty",
                label: "Create Faculty",
                description: "Add new faculty members",
            },
            {
                key: "view_faculty",
                label: "View Faculty",
                description: "View faculty information",
            },
            {
                key: "update_faculty",
                label: "Update Faculty",
                description: "Edit faculty records",
            },
            {
                key: "delete_faculty",
                label: "Delete Faculty",
                description: "Remove faculty records",
            },
        ],
    },
    {
        section: "Courses",
        permissions: [
            {
                key: "create_courses",
                label: "Create Courses",
                description: "Add new courses",
            },
            {
                key: "view_courses",
                label: "View Courses",
                description: "View course information",
            },
            {
                key: "update_courses",
                label: "Update Courses",
                description: "Edit course details",
            },
            {
                key: "delete_courses",
                label: "Delete Courses",
                description: "Remove courses",
            },
        ],
    },
    {
        section: "Degrees",
        permissions: [
            {
                key: "create_degrees",
                label: "Create Degrees",
                description: "Create degree structures",
            },
            {
                key: "view_degrees",
                label: "View Degrees",
                description: "View degree structures",
            },
            {
                key: "update_degrees",
                label: "Update Degrees",
                description: "Edit degree structures",
            },
            {
                key: "delete_degrees",
                label: "Delete Degrees",
                description: "Delete degree structures",
            },
        ],
    },
    {
        section: "Attendance",
        permissions: [
            {
                key: "mark_attendance",
                label: "Mark Attendance",
                description: "Record student attendance",
            },
            {
                key: "view_attendance",
                label: "View Attendance",
                description: "View attendance records",
            },
            {
                key: "edit_attendance",
                label: "Edit Attendance",
                description: "Modify attendance records",
            },
        ],
    },
    {
        section: "Permissions",
        permissions: [
            {
                key: "create_permissions",
                label: "Create Permissions",
                description: "Create custom permissions",
            },
            {
                key: "update_permissions",
                label: "Update Permissions",
                description: "Edit custom permissions",
            },
            {
                key: "delete_permissions",
                label: "Delete Permissions",
                description: "Delete custom permissions",
            },
        ],
    },
    {
        section: "Reports",
        permissions: [
            {
                key: "view_reports",
                label: "View Reports",
                description: "View generated reports",
            },
            {
                key: "create_reports",
                label: "Create Reports",
                description: "Generate new reports",
            },
            {
                key: "export_reports",
                label: "Export Reports",
                description: "Export reports to file",
            },
        ],
    },
];
exports.DEFAULT_PERMISSIONS = exports.DEFAULT_PERMISSION_GROUPS.flatMap((group) => group.permissions.map((permission) => ({ ...permission, section: group.section })));
function getPermissionDefinition(permissionName) {
    return exports.DEFAULT_PERMISSIONS.find((permission) => permission.key === permissionName) || null;
}
function formatPermissionLabel(permissionName) {
    return permissionName
        .split("_")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}
