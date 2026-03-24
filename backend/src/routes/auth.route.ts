import express from "express"
import { authController } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router()

const authcontroller = new authController()

router.post("/login", authcontroller.login.bind(authcontroller));
router.post("/refresh-token", authcontroller.refreshToken.bind(authcontroller));
router.post("/logout", authMiddleware, authcontroller.logout.bind(authcontroller),);


export default router