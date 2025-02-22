import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

export class UserService {
    private db = DatabaseService.getInstance();

    async createUser(data: any) {
        try {
            const user = await this.db.create('users', data);
            logger.info(`[UserService] User created: ${user.userId}`);
            return user;
        } catch (error) {
            logger.error(`[UserService] Error creating user: ${(error as any).message}`);
            throw new Error('Failed to create user.');
        }
    }

    async getAllUsers() {
        try {
            return await this.db.find('users');
        } catch (error) {
            logger.error(`[UserService] Error fetching users: ${(error as any).message}`);
            throw new Error('Failed to fetch users.');
        }
    }

    async getUserById(userId: string) {
        try {
            const user = await this.db.findOne('users', { userId });
            if (!user) {
                throw new Error('User not found.');
            }
            return user;
        } catch (error) {
            logger.error(`[UserService] Error fetching user: ${(error as any).message}`);
            throw new Error((error as any).message);
        }
    }

    async updateUser(userId: string, updateData: any) {
        try {
            const result = await this.db.update('users', { userId }, updateData);
            if (!result) {
                throw new Error('User not found or update failed.');
            }
            logger.info(`[UserService] User updated: ${userId}`);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`[UserService] Error updating user: ${(error as any).message}`);
                throw new Error((error as any).message);
            } else {
                logger.error(`[UserService] Error updating user: ${error}`);
                throw new Error('Failed to update user.');
            }


        }
    }

    async deleteUser(userId: string) {
        try {
            const result = await this.db.delete('users', { userId });
            if (!result) {
                throw new Error('User not found or deletion failed.');
            }
            logger.info(`[UserService] User deleted: ${userId}`);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                logger.error(`[UserService] Error deleting user: ${(error as any).message}`);
                throw new Error((error as any).message);
            } else {
                logger.error(`[UserService] Error deleting user: ${error}`);
                throw new Error('Failed to delete user.');
            }
        }
    }
}
