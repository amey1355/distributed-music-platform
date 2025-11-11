/**
 * Worker Service Entry Point
 * Connects to RabbitMQ and starts consuming messages
 */

import dotenv from "dotenv";
import rabbitmqWorkerConfig from "./config/rabbitmq.config.js";
import { SongConsumer } from "./consumers/song.consumer.js";

dotenv.config();

//startup banner
console.log("\n" + "=".repeat(80));
console.log("🎵 MUSIC PLATFORM WORKER SERVICE");
console.log("=".repeat(80));
console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
console.log(`🐇 RabbitMQ URL: ${process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672"}`);
console.log("=".repeat(80) + "\n");

/**
 * Initialize and start the worker service
 */
async function startWorker(): Promise<void> {
    try {
        console.log("🔄 Connecting to RabbitMQ...");
        await rabbitmqWorkerConfig.connect();

        console.log("🚀 Starting to consume RabbitMQ queues...");
        await SongConsumer.startConsuming();

        console.log("\n✅ Worker service started successfully!");
        console.log("👂 Waiting for messages... (Press CTRL+C to exit)\n");
    } catch (error) {
        console.error("❌ Failed to start worker service:", error);
        console.log("⏳ Retrying connection in 5 seconds...\n");
        setTimeout(() => startWorker(), 5000);
    }
}

/**
 * Graceful shutdown handler
 */
async function gracefulShutdown(signal: string): Promise<void> {
    console.log(`\n⚠️ Received ${signal}. Shutting down gracefully...`);

    try {
        await rabbitmqWorkerConfig.close();
        console.log("✅ RabbitMQ connection closed");
        console.log("👋 Worker service stopped cleanly\n");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during shutdown:", error);
        process.exit(1);
    }
}

//handle termination and error signals
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
    console.error("❌ Uncaught Exception:", error);
    gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
    console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    gracefulShutdown("unhandledRejection");
});

startWorker();