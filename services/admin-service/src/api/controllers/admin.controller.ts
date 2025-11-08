import { Request, Response } from "express";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import getBuffer from "../../utils/dataUri.util.js";
import cloudinary from "cloudinary";
import { sql } from "../../core/database/index.js";
import redisClient from "../../core/database/redis.js";

interface AuthenticatedRequest extends Request {
    user?: {
        _id: string,
        role: string
    }
}

//Utility function for safe cache invalidation
async function invalidateCache(keys: string[]) {
    if (!redisClient.isReady) return;
    try {
        for (const key of keys) {
            await redisClient.del(key);
            console.log(`🗑️ cache invalidated: ${key}`);
        }
    } catch (err) {
        console.error("Redis cache invalidation failed:", err);
    }
}


export const addAlbum = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized: Admins only" });

    const { title, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: "No file is provided" });

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content)
        return res.status(400).json({ message: "Failed to generate file buffer" });

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "albums",
    });

    const result = await sql`
        INSERT INTO albums (title, description, thumbnail)
        VALUES (${title}, ${description}, ${cloud.secure_url})
        RETURNING *
    `;

    //invalidate relevant caches
    await invalidateCache(["albums"]);

    res.json({
        message: "Album created successfully",
        album: result[0],
    });
});


export const addSong = TryCatch(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user?.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized: Admins only" });

    const { title, description, album } = req.body;

    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${album}`;
    if (isAlbum.length === 0)
        return res.status(404).json({ message: "No album found with this id" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file is provided" });

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content)
        return res.status(400).json({ message: "Failed to generate file buffer" });

    const cloude = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "songs",
        resource_type: "video",
    });

    await sql`
        INSERT INTO songs(title, description, audio, album_id)
        VALUES (${title}, ${description}, ${cloude.secure_url}, ${album})
    `;

    //invalidate relevant caches
    await invalidateCache(["songs", `album_songs_${album}`]);

    res.json({ message: "Song added successfully" });
});


export const addThumbnail = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized: Admins only" });

    const song = await sql`SELECT * FROM songs WHERE id = ${req.params.id}`;
    if (song.length === 0)
        return res.status(404).json({ message: "No song found with this id" });

    const file = req.file;
    if (!file) return res.status(400).json({ message: "No file is provided" });

    const fileBuffer = getBuffer(file);
    if (!fileBuffer?.content)
        return res.status(400).json({ message: "Failed to generate file buffer" });

    const cloud = await cloudinary.v2.uploader.upload(fileBuffer.content, {
        folder: "thumbnails",
    });

    const result = await sql`
        UPDATE songs
        SET thumbnail = ${cloud.secure_url}
        WHERE id = ${req.params.id}
        RETURNING *
    `;

    //invalidate caches related to songs and its album
    const albumId = result[0]?.album_id;
    await invalidateCache(["songs", `album_songs_${albumId}`]);

    res.json({
        message: "Thumbnail added successfully",
        song: result[0],
    });
});


export const deleteAlbum = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized: Admins only" });

    const { id } = req.params;

    const isAlbum = await sql`SELECT * FROM albums WHERE id = ${id}`;
    if (isAlbum.length === 0)
        return res.status(404).json({ message: "No album found with this id" });

    await sql`DELETE FROM songs WHERE album_id=${id}`;
    await sql`DELETE FROM albums WHERE id=${id}`;

    //Invalidate caches for albums, songs, and this specific album’s songs
    await invalidateCache(["albums", "songs", `album_songs_${id}`]);

    res.json({ message: "Album deleted successfully" });
});


export const deleteSong = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (req.user?.role !== 'admin')
        return res.status(401).json({ message: "Unauthorized: Admins only" });

    const { id } = req.params;

    const song = await sql`SELECT * FROM songs WHERE id = ${id}`;
    if (song.length === 0)
        return res.status(404).json({ message: "No song found with this id" });

    const albumId = song[0].album_id;

    await sql`DELETE FROM songs WHERE id=${id}`;

    //invalidate caches related to all songs and this album’s songs
    await invalidateCache(["songs", `album_songs_${albumId}`]);

    res.json({ message: "Song deleted successfully" });
});