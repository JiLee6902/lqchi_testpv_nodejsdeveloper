'use strict';

import mongoose, { ConnectOptions } from 'mongoose';
import { MongoDBConfig, DatabaseConfig } from '../configs/env.mongo.js';


class Database {
    private static instance: Database;
    private config: DatabaseConfig;

    constructor() {
        this.config = {
            connectString: MongoDBConfig.uri,
            maxPoolSize: MongoDBConfig.maxPoolSize,
            serverSelectionTimeoutMS: MongoDBConfig.serverSelectionTimeoutMS,
            heartbeatFrequencyMS: MongoDBConfig.heartbeatFrequencyMS
        }
        this.connect();
    }

    private async connect(): Promise<boolean> {
        if (MongoDBConfig.env === 'development') {
            mongoose.set('debug', true)
            mongoose.set('debug', { color: true });
        }

        try {
            const mongooseOptions: ConnectOptions = {
                maxPoolSize: this.config.maxPoolSize,
                serverSelectionTimeoutMS: this.config.serverSelectionTimeoutMS,
                heartbeatFrequencyMS: this.config.heartbeatFrequencyMS
            }

            await mongoose.connect(this.config.connectString, mongooseOptions);
            console.log("Connected to MongoDB successfully!")
            return true;
        } catch (error) {
            console.error("MongoDB connection fail: ", error)
            process.exit(1)
        }
    }

    public static getInstance(): Database {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

export default Database.getInstance();