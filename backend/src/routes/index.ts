import express from "express"
import userRoutes from "./user.route";
import authRoutes from "./auth.route";
import permissionRoutes from "./permission.route"
import roleRoutes from "./role.route"

const router = express.Router()

router.use("/user", userRoutes);
router.use('/auth', authRoutes);
router.use("/permission", permissionRoutes)
router.use("/role", roleRoutes)

export default router;