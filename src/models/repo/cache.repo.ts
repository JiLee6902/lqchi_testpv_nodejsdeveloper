import { getIORedis } from "../../dbs/init.ioredis.js";

interface CacheParams {
    key: string;
    value?: any;
    expirationInSeconds?: number;
}

const getRedisClient = () => {
    const client = getIORedis().instanceConnect;
    if (!client) {
        throw new Error('Redis client not initialized!');
    }
    return client;
}

const setCacheIO = async ({ key, value }: CacheParams): Promise<any> => {
    const redisCache = getRedisClient();
    try {
        return await redisCache.set(key, value);
    } catch (error) {
        throw new Error(`${(error as Error).message}`);
    }
};

const setCacheIOExpiration = async ({ 
    key, 
    value, 
    expirationInSeconds = 3600 
}: CacheParams): Promise<'OK'> => {
    const redisCache = getRedisClient();
    try {
        return await redisCache.set(key, value, 'EX', expirationInSeconds);
    } catch (error) {
        throw new Error(`${(error as Error).message}`);
    }
};

const getCacheIO = async ({ key }: Pick<CacheParams, 'key'>): Promise<string | null> => {
    const redisCache = getRedisClient();
    try {
        return await redisCache.get(key);
    } catch (error) {
        throw new Error(`${(error as Error).message}`);
    }
};

const delCacheIO = async ({ key }: Pick<CacheParams, 'key'>): Promise<number> => {
    const redisCache = getRedisClient();
    try {
        return await redisCache.del(key);
    } catch (error) {
        throw new Error(`${(error as Error).message}`);
    }
};

export {
    setCacheIO,
    setCacheIOExpiration,
    getCacheIO,
    delCacheIO,
}