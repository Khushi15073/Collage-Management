import { NextFunction, Request, Response } from "express";
import UserModel from "../schemas/user.schema";
import { RoleModel } from "../schemas/role.schema";
import { AppError } from "../utility/errorClass";

type PopulatedPermission = {
  _id: string;
  name: string;
};

type PopulatedRole = {
  _id: string;
  name: string;
  permissions?: PopulatedPermission[];
};

type UserAction = "view" | "create" | "update" | "delete";

async function getCurrentUserRole(req: Request) {
  const authUser = (req as any).user;

  if (!authUser?.userId) {
    throw AppError.unauthorized("Unauthorized");
  }

  const currentUser = await UserModel.findById(authUser.userId).populate({
    path: "role",
    populate: { path: "permissions" },
  });

  if (!currentUser) {
    throw AppError.unauthorized("Unauthorized");
  }

  return currentUser.role as unknown as PopulatedRole;
}

async function resolveTargetRoleName(req: Request, action: UserAction) {
  if (action === "view") {
    const roleName = typeof req.query.role === "string" ? req.query.role : "";
    return roleName || null;
  }

  if (action === "create") {
    const roleValue = req.body?.role;

    if (!roleValue || typeof roleValue !== "string") {
      return null;
    }

    const role = await RoleModel.findById(roleValue).select("name");
    return role?.name || null;
  }

  const targetUserId = req.params.id;
  if (!targetUserId) {
    return null;
  }

  const targetUser = await UserModel.findById(targetUserId).populate("role");
  const targetRole = targetUser?.role as unknown as PopulatedRole | undefined;
  return targetRole?.name || null;
}

function buildUserPermissionName(action: UserAction, roleName: string | null) {
  if (roleName === "admin") {
    return `${action}_admins`;
  }

  if (roleName === "student") {
    return `${action}_students`;
  }

  if (roleName === "faculty") {
    return `${action}_faculty`;
  }

  return null;
}

function sendPermissionError(res: Response, error: unknown) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      code: error.statusCode,
      message: error.message,
      data: error.data ?? null,
    });
  }

  return res.status(500).json({
    code: 500,
    message: "Internal server error",
    data: null,
  });
}

export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = await getCurrentUserRole(req);
      const grantedPermissions = new Set(
        (role.permissions || []).map((permission) => permission.name)
      );

      if (grantedPermissions.has(permissionName) === false) {
        throw AppError.forbidden(`Permission denied: ${permissionName}`);
      }

      next();
    } catch (error) {
      return sendPermissionError(res, error);
    }
  };
}

export function requireAdminRole(req: Request, res: Response, next: NextFunction) {
  return requireRoleName("admin")(req, res, next);
}

export function requireRoleName(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    getCurrentUserRole(req)
      .then((role) => {
        if (allowedRoles.includes(role.name) === false) {
          throw AppError.forbidden("Access denied for this role");
        }

        next();
      })
      .catch((error) => sendPermissionError(res, error));
  };
}

export function requireUserPermission(action: UserAction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetRoleName = await resolveTargetRoleName(req, action);
      const permissionName = buildUserPermissionName(action, targetRoleName);

      if (!permissionName) {
        throw AppError.forbidden("Permission mapping not available for this action");
      }

      const role = await getCurrentUserRole(req);
      const grantedPermissions = new Set(
        (role.permissions || []).map((permission) => permission.name)
      );

      if (grantedPermissions.has(permissionName) === false) {
        throw AppError.forbidden(`Permission denied: ${permissionName}`);
      }

      next();
    } catch (error) {
      return sendPermissionError(res, error);
    }
  };
}
