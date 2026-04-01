import express from "express"
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
import permissionRoutes from "./permission.route"
import roleRoutes from "./role.route"
import courseRoutes from "./course.route";
import degreeRoutes from "./degree.route";
import dashboardRoutes from "./dashboard.route";
import attendanceRoutes from "./attendance.route";

const router = express.Router()

router.use("/user", userRoutes);
router.use('/auth', authRoutes);
router.use("/permission", permissionRoutes)
router.use("/role", roleRoutes)
router.use("/course", courseRoutes)
router.use("/degree", degreeRoutes)
router.use("/dashboard", dashboardRoutes)
router.use("/attendance", attendanceRoutes)

export default router;
