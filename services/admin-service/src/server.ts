import app from './app.js';
import { config } from './core/config/index.js';
import { sql } from './core/database/index.js';
import redisClient from './core/database/redis.js';

const port = config.port || 7000;

async function initDB() {
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS albums(
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `;

        await sql`
            CREATE TABLE IF NOT EXISTS songs(
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                description VARCHAR(255) NOT NULL,
                thumbnail VARCHAR(255),
                audio VARCHAR(255) NOT NULL,
                album_id INTEGER REFERENCES albums(id) on DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `;

        console.log("Database initialized successfully");
    } catch (error) {
        console.log("Error initializing DB", error);
        process.exit(1);
    }
}

async function startServer() {
    try {
        await initDB();

        // Connect to Redis
        await redisClient
            .connect()
            .then(() => console.log("✅ Connected to Redis"))
            .catch((error: any) => console.error("Redis connection failed:", error));

        app.listen(port, () => {
            console.log(`Admin Service running on port: ${port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

startServer();