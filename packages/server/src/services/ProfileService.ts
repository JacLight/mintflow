import { logger } from '@mintflow/common';
import { DatabaseService } from './DatabaseService.js';
import { TenantService } from './TenantService.js';

// Table name for profile
const PROFILE_TABLE = 'profile';

export class ProfileService {
    private db = DatabaseService.getInstance();
    private static instance: ProfileService;
    private tenantService: TenantService;

    private constructor() {
        this.tenantService = new TenantService();
        this.initializeDefaultData();
    }

    static getInstance(): ProfileService {
        if (!ProfileService.instance) {
            ProfileService.instance = new ProfileService();
        }
        return ProfileService.instance;
    }

    /**
     * Initialize default profile data for testing purposes.
     * In a production environment, this would be replaced with actual data.
     */
    private async initializeDefaultData() {
        try {
            // Check if we already have profile data
            const existingProfiles = await this.db.find(PROFILE_TABLE);
            if (existingProfiles && existingProfiles.length > 0) {
                return; // Data already exists
            }

            // Create default profile
            const defaultProfile = {
                userId: 'user_123',
                name: 'John Doe',
                email: 'john.doe@example.com',
                avatar: 'https://example.com/avatar.jpg',
                role: 'Admin',
                createdAt: new Date('2024-12-01T10:00:00Z'),
                preferences: {
                    theme: 'light',
                    notifications: true
                }
            };

            await this.db.create(PROFILE_TABLE, defaultProfile);
            logger.info('[ProfileService] Default profile created');
        } catch (error) {
            logger.error(`[ProfileService] Error initializing default data: ${(error as any).message}`);
        }
    }

    /**
     * Get profile by user ID.
     */
    async getProfileByUserId(userId: string) {
        try {
            const profile = await this.db.findOne(PROFILE_TABLE, { userId });
            if (!profile) {
                throw new Error(`Profile not found for user: ${userId}`);
            }
            return profile;
        } catch (error) {
            logger.error(`[ProfileService] Error fetching profile: ${(error as any).message}`);
            throw error;
        }
    }

    /**
     * Update profile.
     */
    async updateProfile(userId: string, data: any) {
        try {
            // Check if profile exists
            const existingProfile = await this.db.findOne(PROFILE_TABLE, { userId });
            if (!existingProfile) {
                throw new Error(`Profile not found for user: ${userId}`);
            }

            // Update profile
            const result = await this.db.update(
                PROFILE_TABLE,
                { userId },
                { ...data, updatedAt: new Date() },
                undefined
            );

            if (!result) {
                throw new Error(`Failed to update profile for user: ${userId}`);
            }

            logger.info(`[ProfileService] Profile updated for user: ${userId}`);
            return await this.db.findOne(PROFILE_TABLE, { userId });
        } catch (error) {
            logger.error(`[ProfileService] Error updating profile: ${(error as any).message}`);
            throw error;
        }
    }
}
