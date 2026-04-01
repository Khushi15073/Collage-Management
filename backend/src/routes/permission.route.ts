import express from "express";
import { PermissionController } from "../controller/permission.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdminRole, requirePermission } from "../middleware/permission.middleware";
const router = express.Router();

const permissionController = new PermissionController();

router.post("/", authMiddleware, requirePermission("create_permissions"), permissionController.createPermission.bind(permissionController))
router.post("/sync-defaults", authMiddleware, requireAdminRole, permissionController.syncDefaultPermissions.bind(permissionController))
router.get("/", authMiddleware, requireAdminRole, permissionController.getAllPermission.bind(permissionController))
router.get("/:id", authMiddleware, requireAdminRole, (req, res) => permissionController.getPermissionById(req as any, res))
router.put("/:id", authMiddleware, requirePermission("update_permissions"), (req, res) => permissionController.updatePermission(req as any, res))
router.delete("/:id", authMiddleware, requirePermission("delete_permissions"), (req, res) => permissionController.deletePermission(req as any, res))
export default router;
