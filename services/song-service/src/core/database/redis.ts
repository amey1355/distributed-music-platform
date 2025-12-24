import redis from "redis";
import { config } from "../config/index.js";

const useCloud = !!process.env.REDIS_CLOUD;
export const redisClient = useCloud
  ? redis.createClient({
      password: config.redis_password,
      socket: {
        host: "redis-16456.crce263.ap-south-1-1.ec2.cloud.redislabs.com",
        port: 16456,
      },
    })
  : redis.createClient({
      url: process.env.REDIS_URL || "redis://redis:6379",
    });

// redisClient.on("error", (err: any) => console.error("Redis error:", err));
// await redisClient.connect();
// console.log("✅ Redis connected");

export default redisClient;