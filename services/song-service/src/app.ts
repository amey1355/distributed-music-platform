import express from 'express';
import cors from 'cors';
import songRoutes from './api/routes/songs.routes.js';

const app = express();

// app.use(cors());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use("/api/v1", songRoutes);

export default app;