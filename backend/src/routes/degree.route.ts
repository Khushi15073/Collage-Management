import express from "express";
import { DegreeController } from "../controller/degree.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { requirePermission } from "../middleware/permission.middleware";

const router = express.Router();
const degreeController = new DegreeController();

router.post("/", authMiddleware, requirePermission("create_degrees"), degreeController.createDegree.bind(degreeController));
router.get("/", authMiddleware, requirePermission("view_degrees"), degreeController.getAllDegrees.bind(degreeController));
router.get("/:id", authMiddleware, requirePermission("view_degrees"), (req, res) => degreeController.getDegreeById(req as any, res));
router.put("/:id", authMiddleware, requirePermission("update_degrees"), (req, res) => degreeController.updateDegree(req as any, res));
router.delete("/:id", authMiddleware, requirePermission("delete_degrees"), (req, res) => degreeController.deleteDegree(req as any, res));

export default router;
