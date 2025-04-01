import express, { Router } from 'express';
import { login, register, refreshToken, verifyToken } from './controllers/AuthController.js';

const authRouter: Router = express.Router();

// Authentication routes
authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.post('/refresh', refreshToken);
authRouter.post('/verify', verifyToken);

export default authRouter;
