import { sql } from "../../core/database/index.js";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import { redisClient } from "../../core/database/redis.js";

// When cache expires, 10 users hitting the same endpoint at once all go to the DB simultaneously. That can overload the DB so making some changes i.e. cache stampede lock. where if a request wins the lock it will hit db and refill the cache, so others will wait a few ms and will then retry redis but will mostly be already filled. 

const CACHE_EXPIRY = 1800;
const LOCK_EXPIRY = 10;

//helper function 1:
async function acquireLock(lockKey: string) {
    //Try to acquire a short-lived redis lock using SET NX EX
    const result = await redisClient.set(lockKey, "locked", { NX: true, EX: LOCK_EXPIRY });
    return result === "OK"; //true if lock was acquired successfully
}

//helper function 2:
async function releaseLock(lockKey: string) {
    await redisClient.del(lockKey);
}


export const getAllAlbum = TryCatch(async (req, res) => {
    const cacheKey = "albums";

    if (redisClient.isReady) {
        const cache = await redisClient.get(cacheKey);
        if (cache) {
            console.log("Cache hit: albums");
            return res.json(JSON.parse(cache));
        }
    }

    console.log("Cache miss: albums");
    let albums;

    const lockKey = `${cacheKey}_lock`;

    const lockAcquired = redisClient.isReady ? await acquireLock(lockKey) : false;

    if (lockAcquired) {
        //We're the first request to miss, so we refill
        albums = await sql`SELECT * FROM albums`;
        if (redisClient.isReady) {
            await redisClient.set(cacheKey, JSON.stringify(albums), { EX: CACHE_EXPIRY });
            await releaseLock(lockKey);
        }
        return res.json(albums);
    } else {
        //Another request is populating cache - wait and retry
        await new Promise((r) => setTimeout(r, 200)); // wait 200ms
        const cacheRetry = await redisClient.get(cacheKey);
        if (cacheRetry) {
            console.log("Cache filled by another request");
            return res.json(JSON.parse(cacheRetry));
        }
        //If still empty, fallback to DB
        albums = await sql`SELECT * FROM albums`;
        return res.json(albums);
    }
});


export const getAllsongs = TryCatch(async (req, res) => {
    const cacheKey = "songs";

    if (redisClient.isReady) {
        const cache = await redisClient.get(cacheKey);
        if (cache) {
            console.log("Cache hit: songs");
            return res.json(JSON.parse(cache));
        }
    }

    console.log("Cache miss: songs");
    let songs;
    const lockKey = `${cacheKey}_lock`;
    const lockAcquired = redisClient.isReady ? await acquireLock(lockKey) : false;

    if (lockAcquired) {
        songs = await sql`SELECT * FROM songs`;
        if (redisClient.isReady) {
            await redisClient.set(cacheKey, JSON.stringify(songs), { EX: CACHE_EXPIRY });
            await releaseLock(lockKey);
        }
        return res.json(songs);
    } else {
        await new Promise((r) => setTimeout(r, 200));
        const cacheRetry = await redisClient.get(cacheKey);
        if (cacheRetry) {
            console.log("Cache filled by another request");
            return res.json(JSON.parse(cacheRetry));
        }
        songs = await sql`SELECT * FROM songs`;
        return res.json(songs);
    }
});


export const getAllSongsOfAlbum = TryCatch(async (req, res) => {
    const { id } = req.params;
    const cacheKey = `album_songs_${id}`;
    const lockKey = `${cacheKey}_lock`;

    if (redisClient.isReady) {
        const cacheData = await redisClient.get(cacheKey);
        if (cacheData) {
            console.log("Cache hit:", cacheKey);
            return res.json(JSON.parse(cacheData));
        }
    }

    console.log("Cache miss:", cacheKey);
    let album, songs;
    const lockAcquired = redisClient.isReady ? await acquireLock(lockKey) : false;

    if (lockAcquired) {
        album = await sql`SELECT * FROM albums WHERE id=${id}`;
        if (album.length === 0)
            return res.status(404).json({ message: "No album with this id" });

        songs = await sql`SELECT * FROM songs WHERE album_id=${id}`;
        const response = { songs, album: album[0] };

        if (redisClient.isReady) {
            await redisClient.set(cacheKey, JSON.stringify(response), { EX: CACHE_EXPIRY });
            await releaseLock(lockKey);
        }

        return res.json(response);
    } else {
        await new Promise((r) => setTimeout(r, 200));
        const cacheRetry = await redisClient.get(cacheKey);
        if (cacheRetry) {
            console.log("Cache filled by another request");
            return res.json(JSON.parse(cacheRetry));
        }
        //Fallback to DB if cache still not ready
        album = await sql`SELECT * FROM albums WHERE id=${id}`;
        if (album.length === 0)
            return res.status(404).json({ message: "No album with this id" });
        songs = await sql`SELECT * FROM songs WHERE album_id=${id}`;
        return res.json({ songs, album: album[0] });
    }
});


export const getSingleSong = TryCatch(async (req, res) => {
    const song = await sql`SELECT * FROM songs WHERE id=${req.params.id}`;
    res.json(song[0]);
});