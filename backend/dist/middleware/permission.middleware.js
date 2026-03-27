"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = requirePermission;
exports.requireAdminRole = requireAdminRole;
exports.requireRoleName = requireRoleName;
exports.requireUserPermission = requireUserPermission;
const user_schema_1 = __importDefault(require("../schemas/user.schema"));
const role_schema_1 = require("../schemas/role.schema");
const errorClass_1 = require("../utility/errorClass");
async function getCurrentUserRole(req) {
    const authUser = req.user;
    if (!(authUser === null || authUser === void 0 ? void 0 : authUser.userId)) {
        throw errorClass_1.AppError.unauthorized("Unauthorized");
    }
    const currentUser = await user_schema_1.default.findById(authUser.userId).populate({
        path: "role",
        populate: { path: "permissions" },
    });
    if (!currentUser) {
        throw errorClass_1.AppError.unauthorized("Unauthorized");
    }
    return currentUser.role;
}
async function resolveTargetRoleName(req, action) {
    var _a;
    if (action === "view") {
        const roleName = typeof req.query.role === "string" ? req.query.role : "";
        return roleName || null;
    }
    if (action === "create") {
        const roleValue = (_a = req.body) === null || _a === void 0 ? void 0 : _a.role;
        if (!roleValue || typeof roleValue !== "string") {
            return null;
        }
        const role = await role_schema_1.RoleModel.findById(roleValue).select("name");
        return (role === null || role === void 0 ? void 0 : role.name) || null;
    }
    const targetUserId = req.params.id;
    if (!targetUserId) {
        return null;
    }
    const targetUser = await user_schema_1.default.findById(targetUserId).populate("role");
    const targetRole = targetUser === null || targetUser === void 0 ? void 0 : targetUser.role;
    return (targetRole === null || targetRole === void 0 ? void 0 : targetRole.name) || null;
}
function buildUserPermissionName(action, roleName) {
    if (roleName === "student") {
        return `${action}_students`;
    }
    if (roleName === "faculty") {
        return `${action}_faculty`;
    }
    return null;
}
function sendPermissionError(res, error) {
    var _a;
    if (error instanceof errorClass_1.AppError) {
        return res.status(error.statusCode).json({
            code: error.statusCode,
            message: error.message,
            data: (_a = error.data) !== null && _a !== void 0 ? _a : null,
        });
    }
    return res.status(500).json({
        code: 500,
        message: "Internal server error",
        data: null,
    });
}
function requirePermission(permissionName) {
    return async (req, res, next) => {
        try {
            const role = await getCurrentUserRole(req);
            const grantedPermissions = new Set((role.permissions || []).map((permission) => permission.name));
            if (grantedPermissions.has(permissionName) === false) {
                throw errorClass_1.AppError.forbidden(`Permission denied: ${permissionName}`);
            }
            next();
        }
        catch (error) {
            return sendPermissionError(res, error);
        }
    };
}
function requireAdminRole(req, res, next) {
    return requireRoleName("admin")(req, res, next);
}
function requireRoleName(...allowedRoles) {
    return (req, res, next) => {
        getCurrentUserRole(req)
            .then((role) => {
            if (allowedRoles.includes(role.name) === false) {
                throw errorClass_1.AppError.forbidden("Access denied for this role");
            }
            next();
        })
            .catch((error) => sendPermissionError(res, error));
    };
}
function requireUserPermission(action) {
    return async (req, res, next) => {
        try {
            const targetRoleName = await resolveTargetRoleName(req, action);
            const permissionName = buildUserPermissionName(action, targetRoleName);
            if (!permissionName) {
                throw errorClass_1.AppError.forbidden("Permission mapping not available for this action");
            }
            const role = await getCurrentUserRole(req);
            const grantedPermissions = new Set((role.permissions || []).map((permission) => permission.name));
            if (grantedPermissions.has(permissionName) === false) {
                throw errorClass_1.AppError.forbidden(`Permission denied: ${permissionName}`);
            }
            next();
        }
        catch (error) {
            return sendPermissionError(res, error);
        }
    };
}
