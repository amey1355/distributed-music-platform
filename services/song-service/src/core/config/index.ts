import dotenv from "dotenv";
dotenv.config();

export const config = {
  dbUrl: process.env.DATABASE_URL as string,
  port: process.env.PORT || 4000,
  redis_password: process.env.Redis_Password as string,
  // userServiceUrl: process.env.User_Service_URL as string,
};