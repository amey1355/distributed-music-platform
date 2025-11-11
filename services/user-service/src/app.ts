import express from "express";
import cors from "cors";
import userRoutes from "./api/routes/user.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1", userRoutes);

export default app;
