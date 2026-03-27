"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const mailer_1 = __importDefault(require("../config/mailer"));
const env_config_1 = require("../config/env.config");
class EmailService {
    async sendEmail(options) {
        if (!env_config_1.config.EMAIL_USER || !env_config_1.config.EMAIL_PASS) {
            throw new Error("Email configuration is missing");
        }
        await mailer_1.default.sendMail({
            from: env_config_1.config.EMAIL_USER,
            to: options.to,
            subject: options.subject,
            html: options.html,
        });
    }
    async sendWelcomeCredentialsEmail(data) {
        const subject = "Your College Management System login credentials";
        const html = `
      <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.6;">
        <h2 style="margin-bottom: 12px;">Welcome to College Management System</h2>
        <p>Hello ${data.userName},</p>
        <p>Your ${data.roleName} account has been created successfully.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Password:</strong> ${data.password}</p>
        <p>You can sign in here: <a href="${data.loginLink}">${data.loginLink}</a></p>
        <p>Please change your password after your first login.</p>
      </div>
    `;
        await this.sendEmail({
            to: data.email,
            subject,
            html,
        });
    }
}
exports.EmailService = EmailService;
