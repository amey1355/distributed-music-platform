import express from 'express';
import { loginUser, myProfile, registerUser } from '../controllers/user.controller.js';
import { isAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/user/register', registerUser);
router.post('/user/login', loginUser);
router.get('/user/me', isAuth, myProfile);

export default router;