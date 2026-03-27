"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controller/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const userController = new user_controller_1.UserController();
router.post("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireUserPermission)("create"), (req, res) => userController.createUser(req, res));
router.get("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireUserPermission)("view"), (req, res) => userController.getAllUsers(req, res));
router.get("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireUserPermission)("view"), (req, res) => userController.getUser(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireUserPermission)("update"), (req, res) => userController.updateUser(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requireUserPermission)("delete"), (req, res) => userController.deleteUser(req, res));
exports.default = router;
