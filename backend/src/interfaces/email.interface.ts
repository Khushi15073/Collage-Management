export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface WelcomeEmailData {
  userName: string;
  email: string;
  password: string;
  roleName: string;
  loginLink: string;
}

export interface ResetPasswordEmailData {
  userName: string;
  resetLink: string;
  expiresIn: string;
}

export interface OTPEmailData {
  userName: string;
  otp: string;
  expiresIn: string;
}
