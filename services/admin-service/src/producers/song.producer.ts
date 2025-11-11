import rabbitmqConfig from "../core/config/rabbitmq.config.js";

/**
 * Interface for "song.uploaded" event
 * Matches DB schema for songs table
 */
interface SongUploadedEvent {
    eventType: "song.uploaded";
    songId: number;            //id from DB
    title: string;
    description: string;
    thumbnail?: string;        //optional in DB
    audio: string;             //required
    albumId?: number | null;   //can be null if not part of album
    createdAt: Date;           //matches songs.created_at
}

/**
 * Interface for "album.created" event
 * Matches DB schema for albums table
 */
interface AlbumCreatedEvent {
    eventType: "album.created";
    albumId: number;
    title: string;
    description: string;
    thumbnail: string;
    createdAt: Date;
}

/**
 * Interface for "song.deleted" event
 * Custom event when a song is deleted
 */
interface SongDeletedEvent {
    eventType: "song.deleted";
    songId: number;
    albumId?: number | null;
    deletedAt: Date;
}

export class SongProducer {
    /**
     * Publish song uploaded event
     */
    static async publishSongUploaded(data: Omit<SongUploadedEvent, "eventType" | "createdAt">): Promise<void> {
        const event: SongUploadedEvent = {
            eventType: "song.uploaded",
            ...data,
            createdAt: new Date(),
        };

        await rabbitmqConfig.publishMessage("song.uploaded", event);
    }

    /**
     * Publish album created event
     */
    static async publishAlbumCreated(data: Omit<AlbumCreatedEvent, "eventType" | "createdAt">): Promise<void> {
        const event: AlbumCreatedEvent = {
            eventType: "album.created",
            ...data,
            createdAt: new Date(),
        };

        await rabbitmqConfig.publishMessage("album.created", event);
    }

    /**
     * Publish song deleted event
     */
    static async publishSongDeleted(data: Omit<SongDeletedEvent, "eventType" | "deletedAt">): Promise<void> {
        const event: SongDeletedEvent = {
            eventType: "song.deleted",
            ...data,
            deletedAt: new Date(),
        };

        await rabbitmqConfig.publishMessage("song.deleted", event);
    }
}
