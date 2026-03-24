import express from "express"
import { RoleController } from "../controller/role.controller";
const router = express.Router();

const roleController = new RoleController()
router.post("/", roleController.createRole.bind(roleController));
router.get("/", roleController.getAllRole.bind(roleController))
router.get("/:id", roleController.getRoleById.bind(roleController))
router.put("/:id", roleController.updateRole.bind(roleController))
router.delete("/:id", roleController.deleteRole.bind(roleController))
export default router
