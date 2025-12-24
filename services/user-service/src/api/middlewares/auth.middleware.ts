import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser, User } from "../../core/database/user.model.js";

export interface AuthenticatedRequest extends Request {
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

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as JwtPayload;

        if (!decoded || !decoded.__id) {
            res.status(403).json({ message: "Token is invalid or expired" });
            return;
        }

        //ALLOW ADMIN TOKENS
        if (decoded.role === "admin") {
            req.user = {
                _id: decoded.__id,
                role: "admin",
            } as any;

            return next();
        }

        const user = await User.findById(decoded.__id).select("-password");

        if (!user) {
            res.status(403).json({ message: "User not found" });
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(403).json({ message: "Please login" });
    }
};