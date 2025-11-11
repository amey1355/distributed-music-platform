import { config } from "./core/config/index.js";
import mongoose from "mongoose";
import app from "./app.js";

const port = config.port || 5000;

//database connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.dbUrl as string, {
      dbName: "DMP",
    });
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

//start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 User Service running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();