"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const role_controller_1 = require("../controller/role.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const roleController = new role_controller_1.RoleController();
router.post("/", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, roleController.createRole.bind(roleController));
router.get("/", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, roleController.getAllRole.bind(roleController));
router.get("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => roleController.getRoleById(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => roleController.updateRole(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, permission_middleware_1.requireAdminRole, (req, res) => roleController.deleteRole(req, res));
exports.default = router;
