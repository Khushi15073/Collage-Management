import express from "express";
import { PermissionController } from "../controller/permission.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdminRole } from "../middleware/permission.middleware";
const router = express.Router();

const permissionController = new PermissionController();

router.post("/", authMiddleware, requireAdminRole, permissionController.createPermission.bind(permissionController))
router.get("/", authMiddleware, requireAdminRole, permissionController.getAllPermission.bind(permissionController))
router.get("/:id", authMiddleware, requireAdminRole, (req, res) => permissionController.getPermissionById(req as any, res))
router.put("/:id", authMiddleware, requireAdminRole, (req, res) => permissionController.updatePermission(req as any, res))
router.delete("/:id", authMiddleware, requireAdminRole, (req, res) => permissionController.deletePermission(req as any, res))
export default router;
