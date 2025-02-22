import { createUser, getAllUsers, getUserById, updateUser, deleteUser } from './controllers/UserController.js';
import express, { Router } from 'express';

const userRouter: Router = express.Router();

userRouter.post('/', createUser);
userRouter.get('/', getAllUsers);
userRouter.get('/:userId', getUserById);
userRouter.put('/:userId', updateUser);
userRouter.delete('/:userId', deleteUser);

export default userRouter;
