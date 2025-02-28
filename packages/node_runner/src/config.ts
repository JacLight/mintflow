import dotenv from 'dotenv';
dotenv.config();

export const CONFIG = {
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    FLOWENGINE_URL: process.env.FLOWENGINE_URL || 'http://localhost:3000/flowengine',
    TENANTS: (process.env.TENANTS || 'tenantA,tenantB').split(',')
};
