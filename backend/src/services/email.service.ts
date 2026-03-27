import transporter from "../config/mailer";
import { config } from "../config/env.config";
import { EmailOptions, WelcomeEmailData } from "../interfaces/email.interface";

export class EmailService {
  async sendEmail(options: EmailOptions) {
    if (!config.EMAIL_USER || !config.EMAIL_PASS) {
      throw new Error("Email configuration is missing");
    }

    await transporter.sendMail({
      from: config.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }

  async sendWelcomeCredentialsEmail(data: WelcomeEmailData) {
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
