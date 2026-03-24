import express from "express";
import { UserController } from "../controller/user.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();
const userController = new UserController();

router.post("/", userController.createUser.bind(userController));
router.get("/",authMiddleware,userController.getAllUsers.bind(userController),);
router.get("/:id", authMiddleware, userController.getUser.bind(userController));
router.put("/:id",authMiddleware,userController.updateUser.bind(userController),);
router.delete("/:id",authMiddleware,userController.deleteUser.bind(userController),);

export default router;
