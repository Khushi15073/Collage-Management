"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_config_1 = require("./env.config");
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: env_config_1.config.EMAIL_USER,
        pass: env_config_1.config.EMAIL_PASS,
    },
});
if (env_config_1.config.EMAIL_USER && env_config_1.config.EMAIL_PASS) {
    transporter.verify((error) => {
        if (error) {
            console.error("Mailer connection failed:", error);
        }
        else {
            console.log("Mailer is ready to send emails");
        }
    });
}
exports.default = transporter;
