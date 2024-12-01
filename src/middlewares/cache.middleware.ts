import { getCacheIO } from "../models/repo/cache.repo.js";
import { Request, Response, NextFunction } from 'express';


const readUser = async(req: Request, res: Response, next: NextFunction) => {
    const {user_id} = req.query;
    const usrKeyCache = `user:${user_id}`;
    let userCache = await getCacheIO({
        key: usrKeyCache
    })
    if (!userCache) return next();
    
    
    return res.status(200).json({
        ...JSON.parse(userCache),
        toLoad:"From redis"

    })
}

export {
    readUser
}