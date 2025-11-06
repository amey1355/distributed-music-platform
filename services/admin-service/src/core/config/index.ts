import dotenv from "dotenv";
dotenv.config();

export const config = {
  dbUrl: process.env.DB_URL as string,
  port: process.env.PORT || 7000,
  redis_password: process.env.Redis_Password as string,
  userServiceUrl: process.env.User_Service_URL as string,
  cl_name: process.env.CLOUD_NAME,
  cl_api_key: process.env.CLOUD_API_KEY,
  cl_api_secret: process.env.CLOUD_API_SECRET,
};