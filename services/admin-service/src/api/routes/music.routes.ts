import express from "express";
import { uploadFile, isAuth } from "../middlewares/auth.middleware.js";
import { addAlbum, addSong, addThumbnail, deleteAlbum, deleteSong } from "../controllers/admin.controller.js";

const router = express.Router();

router.post("/album/new", isAuth, uploadFile, addAlbum);
router.post("/song/new", isAuth, uploadFile, addSong);
router.post("/song/:id", isAuth, uploadFile, addThumbnail);
router.delete("/album/:id", isAuth, deleteAlbum);
router.delete("/song/:id", isAuth, deleteSong);

export default router;