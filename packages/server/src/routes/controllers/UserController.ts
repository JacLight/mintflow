import { Request, Response } from 'express';
import { logger } from '@mintflow/common';
import { UserValidator } from '../../models/validators/UserValidator.js';
import { UserService } from '../../services/UserService.js';

const userService = new UserService();

/**
 * Create a new user.
 */
export async function createUser(req: Request, res: Response): Promise<any> {
    try {
        const { error } = UserValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const user = await userService.createUser(req.body);
        return res.status(201).json(user);
    } catch (err: any) {
        logger.error(`[UserController] Error creating user: ${err.message}`);
        return res.status(500).json({ error: 'Failed to create user' });
    }
}

/**
 * Get all users.
 */
export async function getAllUsers(req: Request, res: Response): Promise<any> {
    try {
        const users = await userService.getAllUsers();
        return res.status(200).json(users);
    } catch (err: any) {
        logger.error(`[UserController] Error fetching users: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
}

/**
 * Get a single user by ID.
 */
export async function getUserById(req: Request, res: Response): Promise<any> {
    try {
        const user = await userService.getUserById(req.params.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(user);
    } catch (err: any) {
        logger.error(`[UserController] Error fetching user: ${err.message}`);
        return res.status(500).json({ error: 'Failed to fetch user' });
    }
}

/**
 * Update a user.
 */
export async function updateUser(req: Request, res: Response): Promise<any> {
    try {
        const { error } = UserValidator.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const updatedUser = await userService.updateUser(req.params.userId, req.body);
        if (!updatedUser) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json(updatedUser);
    } catch (err: any) {
        logger.error(`[UserController] Error updating user: ${err.message}`);
        return res.status(500).json({ error: 'Failed to update user' });
    }
}

/**
 * Delete a user.
 */
export async function deleteUser(req: Request, res: Response): Promise<any> {
    try {
        const deletedUser = await userService.deleteUser(req.params.userId);
        if (!deletedUser) return res.status(404).json({ error: 'User not found' });

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err: any) {
        logger.error(`[UserController] Error deleting user: ${err.message}`);
        return res.status(500).json({ error: 'Failed to delete user' });
    }
}
