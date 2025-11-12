import express from 'express';
import cors from 'cors';
import adminRoutes from './api/routes/music.routes.js';
import { configureCloudinary } from './core/config/cloudinary.config.js';
import rabbitmqConfig from "./core/config/rabbitmq.config.js";

const app = express();

configureCloudinary();

//connect to RabbitMQ
rabbitmqConfig
  .connect()
  .then(() => console.log("✅ RabbitMQ connection established from app.ts"))
  .catch((err) => console.error("❌ RabbitMQ connection failed:", err));

//graceful shutdown
process.on("SIGINT", async () => {
  await rabbitmqConfig.close();
  process.exit(0);
});

// app.use(cors());
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use("/api/v1", adminRoutes);

export default app;