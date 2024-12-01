'use strict'

import { Redis } from "ioredis"
import { BadRequestError } from "../core/error.response.js";

interface RedisClient {
    instanceConnect?: Redis
}

interface RedisConfig {
    IOREDIS_IS_ENABLED: boolean;
    IOREDIS_HOST?: string;
    IOREDIS_PORT?: number;
}

enum statusConnectRedis {
    CONNECT = 'connect',
    END = 'end',
    RECONNECT = 'reconnecting',
    ERROR = 'error'
}

const REDIS_CONNECT_TIMEOUT = 10000;

let client: RedisClient = {}
let connectionTimeout: NodeJS.Timeout;

const handleTimeoutError = () => {
    connectionTimeout = setTimeout(() => {
        throw new BadRequestError('Error connect Redis!')
    }, REDIS_CONNECT_TIMEOUT)
}

const handleEventConnection = ({
    connectionRedis
}: {
    connectionRedis: Redis
}) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log(`connectionIORedis - Connection status: connected`);
        clearTimeout(connectionTimeout);
    });

    connectionRedis.on(statusConnectRedis.END, () => {
        console.log(`connectionIORedis - Connection status: disconnected`);
        handleTimeoutError();
    });

    connectionRedis.on(statusConnectRedis.RECONNECT, () => {
        console.log(`connectionIORedis - Connection status: reconnecting`);
        clearTimeout(connectionTimeout);
    });

    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log(`connectionIORedis - Connection status: error ${err}`);
        handleTimeoutError();
    });
}

const initIORedis = ({
    IOREDIS_IS_ENABLED,
    IOREDIS_HOST = 'redis',
    IOREDIS_PORT = 6379
}: RedisConfig) => {
    if (IOREDIS_IS_ENABLED) {
        const instanceRedis = new Redis({
            host: IOREDIS_HOST,
            port: IOREDIS_PORT,
            retryStrategy: (times) => Math.min(times * 50, 2000)
        })

        client.instanceConnect = instanceRedis;
        handleEventConnection({
            connectionRedis: instanceRedis
        });
    }
}

const getIORedis = () => client

const closeIORedis = () => {
    if (client.instanceConnect) {
        client.instanceConnect.quit((err, res) => {
            if (err) {
                console.error('Error closing Redis connection:', err);
            } else {
                handleEventConnection({ connectionRedis: client.instanceConnect! });
                console.log('Redis connection closed:', res);
            }
        });
    } else {
        console.warn('Redis client is not initialized.');
    }
}

export {
    initIORedis,
    getIORedis,
    closeIORedis
};