'use strict'

import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const MongoDBConfigSchema = z.object({

    MONGODB_URI: z.string({
        required_error: "MongoDB connection string is required",
        invalid_type_error: "MongoDB URI must be a string"
    }).url({ message: "Invalid MongoDB connection URI" }),

    MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(50),
    MONGODB_SERVER_TIMEOUT: z.coerce.number().int().positive().default(30000),
    MONGODB_HEARTBEAT_FREQUENCY: z.coerce.number().int().positive().default(2000),

    NODE_ENV: z.enum(['development', 'production', 'test']).default('development')
});

const parsedEnv = MongoDBConfigSchema.safeParse(process.env);

if (!parsedEnv.success) {
    console.error('Invalid environment configuration:', parsedEnv.error.errors);
    process.exit(1);
}

export const MongoDBConfig = {
    uri: parsedEnv.data.MONGODB_URI,
    maxPoolSize: parsedEnv.data.MONGODB_MAX_POOL_SIZE,
    serverSelectionTimeoutMS: parsedEnv.data.MONGODB_SERVER_TIMEOUT,
    heartbeatFrequencyMS: parsedEnv.data.MONGODB_HEARTBEAT_FREQUENCY,
    env: parsedEnv.data.NODE_ENV
};

export interface DatabaseConfig {
    connectString: string;
    maxPoolSize?: number;
    serverSelectionTimeoutMS?: number;
    heartbeatFrequencyMS?: number;
}