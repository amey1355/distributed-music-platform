import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { config } from "../../core/config/index.js";

interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    playlist: string[];
}

interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(403).json({ message: "Please login" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const { data } = await axios.get(
      `${config.userServiceUrl}/api/v1/user/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    req.user = data;
    next();
  } catch (error: any) {
  console.error(
    "Auth failed calling user-service:",
    error.response?.status,
    error.response?.data,
    error.message
  );

  res.status(403).json({ message: "Please login" });
}
};


//multer setup for file upload
import multer from "multer";

const storage = multer.memoryStorage();

export const uploadFile = multer({ storage }).single("file");

