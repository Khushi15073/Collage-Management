import dotenv from "dotenv"
dotenv.config()

export const config ={
    MONGODB_URI:process.env.MONGODB_URI as string,
    PORT: process.env.PORT ,
    JWT_SECRET:process.env.JWT_SECRET,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET
}