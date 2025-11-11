import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { IUser, User } from '../../core/database/user.model.js';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.token as string;
        if (!token) {
            res.status(403).json({ message: "Please login" });
            return;
        }

        const decodedVerify = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        if (!decodedVerify || !decodedVerify.__id) {
            res.status(403).json({ message: "Token is invalid / expired" });
            return;
        }

        const userId = decodedVerify.__id;
        const user = await User.findById(userId).select("-password");

        if (!user) {
            res.status(403).json({ message: "User not found" });
            return;
        }

        req.user = user;
        next();

    } catch (error) {
        res.status(403).json({ message: "Please login" });
    }
}