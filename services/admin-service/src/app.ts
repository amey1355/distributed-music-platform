import express from 'express';
import cors from 'cors';
import adminRoutes from './api/routes/music.routes.js';
import { configureCloudinary } from './core/config/cloudinary.config.js';

const app = express();

configureCloudinary();

app.use(cors());
app.use(express.json());

app.use("/api/v1", adminRoutes);

export default app;