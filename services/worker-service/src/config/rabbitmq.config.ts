import amqp, { Channel, Connection, ConsumeMessage } from "amqplib";

export type MessageHandler = (message: any) => Promise<void>;

class RabbitMQWorkerConfig {
    private connection: any | Connection | null = null;
    private channel: any | Channel | null = null;
    private readonly url: string;
    private readonly exchangeName = "music-platform-exchange";
    private readonly queues = {
        songUploaded: "song.uploaded.queue",
        albumCreated: "album.created.queue",
        songDeleted: "song.deleted.queue",
    };
    private isReconnecting = false; // ✅ prevent multiple reconnect attempts

    constructor() {
        this.url = process.env.RABBITMQ_URL || "amqp://admin:admin123@localhost:5672";
    }

    /**
     * Establish connection to RabbitMQ and set up exchange/queues
     */
    async connect(): Promise<void> {
        try {
            console.log("🔄 Worker: Connecting to RabbitMQ...");

            this.connection = await amqp.connect(this.url);
            console.log("✅ Worker: RabbitMQ connected successfully");

            this.channel = await this.connection.createChannel();
            await this.channel.prefetch(1); //fair dispatch (1 msg per worker)
            console.log("✅ Worker: Channel created with prefetch=1");

            //declare exchange
            await this.channel.assertExchange(this.exchangeName, "topic", {
                durable: true,
            });

            //Declare and bind queues (same as admin-service)
            for (const [key, queueName] of Object.entries(this.queues)) {
                await this.channel.assertQueue(queueName, { durable: true });
                await this.channel.bindQueue(queueName, this.exchangeName, key.replace(/[A-Z]/g, (m) => "." + m.toLowerCase()));
            }

            console.log("✅ Worker: All queues declared and bound");

            //handle connection error
            this.connection.on("error", (err: unknown) => {
                console.error("❌ Worker: RabbitMQ connection error:", err);
            });

            //handle connection close and auto-reconnect
            this.connection.on("close", async () => {
                console.warn("⚠️ Worker: RabbitMQ connection closed. Attempting to reconnect...");
                if (this.isReconnecting) return; // ✅ Prevent duplicate loops
                this.isReconnecting = true;

                this.connection = null;
                this.channel = null;

                setTimeout(async () => {
                    this.isReconnecting = false;
                    await this.connect();
                }, 5000);
            });

        } catch (error) {
            console.error("❌ Worker: Failed to connect to RabbitMQ:", error);
            //Auto-retry after delay
            setTimeout(() => this.connect(), 5000);
        }
    }

    /**
     * Consume messages from a queue and process them with a handler
     */
    async consumeQueue(queueName: string, handler: MessageHandler): Promise<void> {
        if (!this.channel) {
            console.error("❌ Worker: Channel not initialized");
            return;
        }

        try {
            await this.channel.consume(
                queueName,
                async (msg: ConsumeMessage | null) => {
                    if (!msg) return;

                    try {
                        const messageContent = JSON.parse(msg.content.toString());
                        console.log(`📥 Worker: Received message from ${queueName}:`, messageContent);

                        //Process the message
                        await handler(messageContent);

                        //Acknowledge successful processing
                        this.channel?.ack(msg);
                        console.log(`✅ Worker: Message processed and acknowledged (${queueName})`);

                    } catch (error) {
                        console.error(`❌ Worker: Error processing message from ${queueName}:`, error);

                        if (msg.fields.redelivered) {
                            console.warn("⚠️ Worker: Message already redelivered. Sending to DLQ.");
                            this.channel?.nack(msg, false, false);
                        } else {
                            console.log("🔄 Worker: Requeuing message for retry...");
                            this.channel?.nack(msg, false, true);
                        }
                    }
                },
                { noAck: false } //manual acknowledgment mode
            );

            console.log(`👂 Worker: Listening for messages on ${queueName}...`);
        } catch (error) {
            console.error(`❌ Worker: Error setting up consumer for ${queueName}:`, error);
        }
    }

    getQueueNames() {
        return this.queues;
    }

    /**
     * Gracefully close connection and channel
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
            console.log("✅ Worker: RabbitMQ connection closed gracefully");
        } catch (error) {
            console.error("❌ Worker: Error closing RabbitMQ connection:", error);
        }
    }
}

//Singleton instance
const rabbitmqWorkerConfig = new RabbitMQWorkerConfig();
export default rabbitmqWorkerConfig;