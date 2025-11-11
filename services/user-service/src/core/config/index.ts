import dotenv from "dotenv";
dotenv.config();

export const config = {
  dbUrl: process.env.MONGO_URI as string,
  port: process.env.PORT || 5000,
  jwt_secret: process.env.JWT_SECRET
};