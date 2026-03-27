import express from "express";
import { UserController } from "../controller/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requireUserPermission } from "../middleware/permission.middleware";

const router = express.Router();
const userController = new UserController();

router.post("/", authMiddleware, requireUserPermission("create"), (req, res) => userController.createUser(req, res));
router.get("/", authMiddleware, requireUserPermission("view"), (req, res) => userController.getAllUsers(req, res));
router.get("/:id", authMiddleware, requireUserPermission("view"), (req, res) => userController.getUser(req as any, res));
router.put("/:id", authMiddleware, requireUserPermission("update"), (req, res) => userController.updateUser(req as any, res));
router.delete("/:id", authMiddleware, requireUserPermission("delete"), (req, res) => userController.deleteUser(req as any, res));

export default router;
