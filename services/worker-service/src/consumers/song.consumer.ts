/**
 * Song Consumer
 * Consumes messages from RabbitMQ queues and routes them to appropriate handlers
 */

import rabbitmqWorkerConfig from "../config/rabbitmq.config.js";
import { NotificationHandler } from "../handlers/notification.handler.js";
import { SearchIndexHandler } from "../handlers/search-index.handler.js";
import { MediaProcessingHandler } from "../handlers/media-processing.handler.js";

//Updated event interfaces to match admin-service producer
interface SongUploadedEvent {
    eventType: "song.uploaded";
    songId: number;
    title: string;
    description: string;
    audio: string;
    thumbnail?: string;
    albumId?: number | null;
    createdAt: Date;
}

interface AlbumCreatedEvent {
    eventType: "album.created";
    albumId: number;
    title: string;
    description: string;
    thumbnail: string;
    createdAt: Date;
}

interface SongDeletedEvent {
    eventType: "song.deleted";
    songId: number;
    albumId?: number | null;
    deletedAt: Date;
}

export class SongConsumer {
    /**
     * Start consuming all queues
     */
    static async startConsuming(): Promise<void> {
        const queues = rabbitmqWorkerConfig.getQueueNames();

        //Consume song uploaded events
        await rabbitmqWorkerConfig.consumeQueue(
            queues.songUploaded,
            this.handleSongUploaded.bind(this)
        );

        //Consume album created events
        await rabbitmqWorkerConfig.consumeQueue(
            queues.albumCreated,
            this.handleAlbumCreated.bind(this)
        );

        //consume song deleted events
        await rabbitmqWorkerConfig.consumeQueue(
            queues.songDeleted,
            this.handleSongDeleted.bind(this)
        );

        console.log("\n🚀 Worker is ready to process messages!\n");
    }

    /**
     * Handle song uploaded event
     */
    private static async handleSongUploaded(message: SongUploadedEvent): Promise<void> {
        console.log("\n" + "=".repeat(80));
        console.log("🎵 PROCESSING: Song Uploaded Event");
        console.log("=".repeat(80));
        console.log(`🎶 Title: ${message.title}`);
        console.log(`🆔 Song ID: ${message.songId}`);
        console.log(`💿 Album ID: ${message.albumId ?? "N/A"}`);
        console.log(`🕒 Uploaded at: ${message.createdAt}`);
        console.log("=".repeat(80) + "\n");

        try {
            //execute all handlers in parallel
            await Promise.all([
                // 1️⃣ Send user notifications
                NotificationHandler.handleSongUploaded(message),

                // 2️⃣ Index song in search
                SearchIndexHandler.indexSong(message),

                // 3️⃣ Run media processing (waveform, preview, etc.)
                MediaProcessingHandler.processSongMedia(message),
            ]);

            console.log("\n" + "=".repeat(80));
            console.log("✅ Song Upload Event Processing COMPLETED Successfully");
            console.log("=".repeat(80) + "\n");

        } catch (error) {
            console.error("\n❌ Error processing song uploaded event:", error);
            throw error; //triggers retry in RabbitMQ
        }
    }

    /**
     * Handle album created event
     */
    private static async handleAlbumCreated(message: AlbumCreatedEvent): Promise<void> {
        console.log("\n" + "=".repeat(80));
        console.log("💿 PROCESSING: Album Created Event");
        console.log("=".repeat(80));
        console.log(`📀 Album Title: ${message.title}`);
        console.log(`🆔 Album ID: ${message.albumId}`);
        console.log(`🕒 Created at: ${message.createdAt}`);
        console.log("=".repeat(80) + "\n");

        try {
            await Promise.all([
                // 1️⃣ Notify subscribers
                NotificationHandler.handleAlbumCreated(message),

                // 2️⃣ Add to search index
                SearchIndexHandler.indexAlbum(message),
            ]);

            console.log("\n" + "=".repeat(80));
            console.log("✅ Album Created Event Processing COMPLETED Successfully");
            console.log("=".repeat(80) + "\n");

        } catch (error) {
            console.error("\n❌ Error processing album created event:", error);
            throw error;
        }
    }

    /**
     * Handle song deleted event
     */
    private static async handleSongDeleted(message: SongDeletedEvent): Promise<void> {
        console.log("\n" + "=".repeat(80));
        console.log("🗑️ PROCESSING: Song Deleted Event");
        console.log("=".repeat(80));
        console.log(`🆔 Song ID: ${message.songId}`);
        console.log(`💿 Album ID: ${message.albumId ?? "N/A"}`);
        console.log(`🕒 Deleted at: ${message.deletedAt}`);
        console.log("=".repeat(80) + "\n");

        try {
            //remove from search index
            await SearchIndexHandler.removeSongFromIndex(message);

            //optional: Add cleanup or analytics tasks here
            // e.g., remove media files, update DB, notify admins, etc.

            console.log("\n" + "=".repeat(80));
            console.log("✅ Song Deleted Event Processing COMPLETED Successfully");
            console.log("=".repeat(80) + "\n");

        } catch (error) {
            console.error("\n❌ Error processing song deleted event:", error);
            throw error;
        }
    }
}
