import * as amqp from "amqplib";
import { Connection, Channel } from "amqplib";

class RabbitMQConfig {
    private connection: any | null = null;
    private channel: any | null = null;
    private readonly url: string;
    private readonly exchangeName = "music-platform-exchange";
    private readonly queues = {
        songUploaded: "song.uploaded.queue",
        albumCreated: "album.created.queue",
        songDeleted: "song.deleted.queue",
    };

    constructor() {
        this.url = process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672";
    }

    /**
     * Connect to RabbitMQ and set up exchange + queues
     */
    async connect(): Promise<void> {
        try {
            console.log("🔄 Connecting to RabbitMQ...");

            //this.connection = await amqp.connect(this.url);
            this.connection = (await amqp.connect(this.url)) as unknown as amqp.Connection;
            console.log("✅ RabbitMQ connected successfully");

            this.channel = await this.connection.createChannel();
            console.log("✅ RabbitMQ channel created");

            //Declare exchange
            await this.channel.assertExchange(this.exchangeName, "topic", {
                durable: true,
            });
            console.log(`✅ Exchange declared: ${this.exchangeName}`);

            //Declare and bind queues
            for (const [key, queueName] of Object.entries(this.queues)) {
                await this.channel.assertQueue(queueName, { durable: true });
                await this.channel.bindQueue(queueName, this.exchangeName, key.replace(/[A-Z]/g, (m) => "." + m.toLowerCase()));
                console.log(`✅ Queue declared & bound: ${queueName}`);
            }

            //Handle connection close / error events
            this.connection.on("error", (err: unknown) => {
                console.error("❌ RabbitMQ connection error:", err);
            });

            this.connection.on("close", () => {
                console.log("⚠️ RabbitMQ connection closed. Reconnecting...");
                this.connection = null;
                this.channel = null;
                setTimeout(() => this.connect(), 5000);
            });

        } catch (error) {
            console.error("❌ Failed to connect to RabbitMQ:", error);
            this.connection = null;
            this.channel = null;
            setTimeout(() => this.connect(), 5000); // Retry after 5 seconds
        }
    }

    /**
     * Publish a message to the exchange with a routing key
     */
    async publishMessage(routingKey: string, message: any): Promise<boolean> {
        try {
            if (!this.channel) {
                console.error("❌ Channel not initialized");
                return false;
            }

            const messageBuffer = Buffer.from(JSON.stringify(message));

            const published = this.channel.publish(
                this.exchangeName,
                routingKey,
                messageBuffer,
                {
                    persistent: true,
                    contentType: "application/json",
                    timestamp: Date.now(),
                }
            );

            if (published) {
                console.log(`📤 Message published to ${routingKey}:`, message);
                return true;
            } else {
                console.error("❌ Failed to publish message");
                return false;
            }
        } catch (error) {
            console.error("❌ Error publishing message:", error);
            return false;
        }
    }

    /**
     * Gracefully close the channel and connection
     */
    async close(): Promise<void> {
        try {
            if (this.channel) {
                await this.channel.close();
                this.channel = null;
            }
            if (this.connection) {
                await this.connection.close();
                this.connection = null;
            }
            console.log("✅ RabbitMQ connection closed gracefully");
        } catch (error) {
            console.error("❌ Error closing RabbitMQ connection:", error);
        }
    }

    /**
     * Get the current channel instance safely
     */
    getChannel(): amqp.Channel | null {
        return this.channel;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return !!this.connection && !!this.channel;
    }
}

//Singleton instance
const rabbitmqConfig = new RabbitMQConfig();
export default rabbitmqConfig;
