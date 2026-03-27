"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = express_1.default.Router();
const authcontroller = new auth_controller_1.authController();
router.post("/login", authcontroller.login.bind(authcontroller));
router.post("/refresh-token", authcontroller.refreshToken.bind(authcontroller));
router.get("/me", auth_middleware_1.authMiddleware, authcontroller.me.bind(authcontroller));
router.post("/logout", auth_middleware_1.authMiddleware, authcontroller.logout.bind(authcontroller));
exports.default = router;
