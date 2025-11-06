import redis from "redis";
import { config } from "../config/index.js";

export const redisClient = redis.createClient({
  password: config.redis_password,
  socket: {
    host: "redis-10487.crce179.ap-south-1-1.ec2.redns.redis-cloud.com",
    port: 10487,
  },
});

// redisClient.on("error", (err: any) => console.error("Redis error:", err));
// await redisClient.connect();
// console.log("✅ Redis connected");

export default redisClient;