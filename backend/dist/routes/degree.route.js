"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const degree_controller_1 = require("../controller/degree.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const permission_middleware_1 = require("../middleware/permission.middleware");
const router = express_1.default.Router();
const degreeController = new degree_controller_1.DegreeController();
router.post("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("create_degrees"), degreeController.createDegree.bind(degreeController));
router.get("/", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("view_degrees"), degreeController.getAllDegrees.bind(degreeController));
router.get("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("view_degrees"), (req, res) => degreeController.getDegreeById(req, res));
router.put("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("update_degrees"), (req, res) => degreeController.updateDegree(req, res));
router.delete("/:id", auth_middleware_1.authMiddleware, (0, permission_middleware_1.requirePermission)("delete_degrees"), (req, res) => degreeController.deleteDegree(req, res));
exports.default = router;
