import app from './app.js';
import { config } from './core/config/index.js';
import redisClient from './core/database/redis.js';

const port = config.port || 8000;

async function startServer() {
    try {
        // Connect to Redis
        await redisClient
            .connect()
            .then(() => console.log("✅ Connected to Redis"))
            .catch((error: any) => console.error("Redis connection failed:", error));

        app.listen(port, () => {
            console.log(`Song Service running on port: ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

startServer();