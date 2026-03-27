import nodemailer, { Transporter } from 'nodemailer';
import { config } from './env.config';

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.EMAIL_USER as string,
    pass: config.EMAIL_PASS as string,
  },
});

if (config.EMAIL_USER && config.EMAIL_PASS) {
  transporter.verify((error) => {
    if (error) {
      console.error("Mailer connection failed:", error);
    } else {
      console.log("Mailer is ready to send emails");
    }
  });
}

export default transporter;
