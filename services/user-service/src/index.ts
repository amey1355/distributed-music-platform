import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;

//db connection
const connectDB = async () => {
    try {
        mongoose.connect(process.env.MONGO_URI as string, {
            dbName: "DMP",
        });
        console.log("MongoDB connected");
    } catch (error) {
        console.log(error);
    }
};

app.use("/api/v1", userRoutes);

//start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    connectDB();
});
