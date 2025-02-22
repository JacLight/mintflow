import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';

const TABLE_NAME = 'user';
export class UserService {
    private db = DatabaseService.getInstance();

    async createUser(data: any) {
        try {
            const user = await this.db.create(TABLE_NAME, data);
            logger.info(`[UserService] User created: ${user.userId}`);
            return user;
        } catch (error) {
            logger.error(`[UserService] Error creating user: ${(error as any).message}`);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await this.db.find(TABLE_NAME);
        } catch (error) {
            logger.error(`[UserService] Error fetching users: ${(error as any).message}`);
            throw error;
        }
    }

    async getUserById(userId: string) {
        try {
            const user = await this.db.findOne(TABLE_NAME, { userId });
            if (!user) {
                throw new Error('User not found.');
            }
            return user;
        } catch (error) {
            logger.error(`[UserService] Error fetching user: ${(error as any).message}`);
            throw error;
        }
    }

    async updateUser(userId: string, updateData: any) {
        try {
            const result = await this.db.update(TABLE_NAME, { userId }, updateData);
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
                throw error;
            }


        }
    }

    async deleteUser(userId: string) {
        try {
            const result = await this.db.delete(TABLE_NAME, { userId });
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
                throw error;
            }
        }
    }
}
