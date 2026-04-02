import express from "express"
import { RoleController } from "../controller/role.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireAdminRole } from "../middleware/permission.middleware";
const router = express.Router();

const roleController = new RoleController()
router.post("/", authMiddleware, requireAdminRole, roleController.createRole.bind(roleController));
router.get("/", authMiddleware, roleController.getAllRole.bind(roleController))
router.get("/:id", authMiddleware, (req, res) => roleController.getRoleById(req as any, res))
router.put("/:id", authMiddleware, requireAdminRole, (req, res) => roleController.updateRole(req as any, res))
router.delete("/:id", authMiddleware, requireAdminRole, (req, res) => roleController.deleteRole(req as any, res))
export default router
