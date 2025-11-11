import { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import TryCatch from "../middlewares/tryCatch.middleware.js";
import { User } from "../../core/database/user.model.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


// Register User
export const registerUser = TryCatch(async (req, res) => {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });

    if (user) {
        res.status(400).json({ message: "User already exists" });
        return;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashPassword,
    });

    const token = jwt.sign({ __id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.status(201).json({
        message: "User registered successfully",
        user,
        token,
    });
});

// Login User
export const loginUser = TryCatch(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ message: "Invalid email or password" });
        return;
    }

    const token = jwt.sign({ __id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
    res.status(200).json({
        message: "User logged in",
        user,
        token,
    });
});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.json(user);
});