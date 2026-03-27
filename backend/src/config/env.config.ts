import dotenv from "dotenv"
dotenv.config()

export const config ={
    MONGODB_URI:process.env.MONGODB_URI as string,
    PORT: process.env.PORT ,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET,
    EMAIL_USER: process.env.EMAIL_USER?.trim(),
    EMAIL_PASS: process.env.EMAIL_PASS?.trim(),
    FRONTEND_URL: process.env.FRONTEND_URL?.trim() || "http://localhost:5173",
}
