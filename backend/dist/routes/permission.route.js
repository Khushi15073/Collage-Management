"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const permission_controller_1 = require("../controller/permission.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const permissionController = new permission_controller_1.PermissionController();
router.post("/", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, permissionController.createPermission.bind(permissionController));
router.get("/", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, permissionController.getAllPermission.bind(permissionController));
router.get("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => permissionController.getPermissionById(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => permissionController.updatePermission(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => permissionController.deletePermission(req, res));
exports.default = router;
