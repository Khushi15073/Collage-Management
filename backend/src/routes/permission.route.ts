import express from "express";
import { PermissionController } from "../controller/permission.controller";
const router = express.Router();

const permissionController = new PermissionController();

router.post("/", permissionController.createPermission.bind(permissionController))
router.get("/", permissionController.getAllPermission.bind(permissionController))
router.get("/:id", permissionController.getPermissionById.bind(permissionController))
router.put("/:id", permissionController.updatePermission.bind(permissionController))
router.delete("/:id", permissionController.deletePermission.bind(permissionController))
export default router;