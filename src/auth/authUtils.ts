'use strict'

import jwt from 'jsonwebtoken';
import asyncHandler from '../helpers/asyncHandler.js';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthFailureError, BadRequestError, NotFoundError } from '../core/error.response.js';
import keyTokenService from '../services/keyToken.service.js';
import { convertToObjectId } from '../utils/index.js';
import { KeyToken, IKeyToken } from '../models/keytoken.model.js';
import userModel from '../models/user.model.js';
import { Types } from 'mongoose';
import logger from '../logger/logger.js';


declare global {
    namespace Express {
        interface Request {
            keyStore?: IKeyToken;
            user?: DecodedUser;
            refreshToken?: string;
        }
    }
}

enum HEADER {
    CLIENT_ID = 'x-client-id',
    AUTHORIZATION = 'authorization',
    REFRESHTOKEN = 'x-rtoken-id',
}

interface Payload {
    userId: string;
    username: string;
    [key: string]: any;
}

interface DecodedUser {
    userId: string;
    username: string;
    [key: string]: any;
}

const createTokenPair = async (
    payload: Payload,
    publicKey: string,
    privateKey: string
): Promise<{ accessToken: string; refreshToken: string }> => {
    try {
        const accessToken = await jwt.sign(payload, publicKey, {
            expiresIn: '15m'
        })

        const refreshToken = await jwt.sign(payload, privateKey, {
            expiresIn: '3d'
        })

        try {
            const decoded = jwt.verify(accessToken, publicKey);
            console.log('Decoded token:', decoded);
        } catch (error) {
            console.error('Token verification error:', error);
        }

        return { accessToken, refreshToken }
    } catch (err) {
        console.error('Error creating token pair:', err);
        throw new BadRequestError('Token creation failed');
    }
}

const getUserId = (userId: string | string[] | undefined): string => {
    if (!userId) throw new AuthFailureError("Not exist this account!!");
    return Array.isArray(userId) ? userId[0] : userId;
};

const getTokenFromHeader = (token: string | string[] | undefined): string => {
    if (!token) throw new AuthFailureError('Invalid Request!');
    return Array.isArray(token) ? token[0] : token;
};

const authentication: RequestHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getUserId(req.headers[HEADER.CLIENT_ID]);
        const userValid = await userModel.findById(userId)
        if (userValid?.usr_status === 'deactive') throw new AuthFailureError('Account is deactive!')

        const key = await keyTokenService.findByUserId(convertToObjectId(userId));
        if (!key || !key.isActive) {
            throw new NotFoundError('Key invalid!');
        }
        req.keyStore = key;

        if (req.headers[HEADER.REFRESHTOKEN]) {
            try {
                const refreshToken = getTokenFromHeader(req.headers[HEADER.REFRESHTOKEN]);
                if (key.refreshTokensUsed.includes(refreshToken)) {
                    await keyTokenService.deleteKeyById(new Types.ObjectId(userId));
                    throw new AuthFailureError("Your account is having problems. Please log in again!");
                }

                const decodedUser = jwt.verify(refreshToken, key.privateKey) as DecodedUser;

                if (userId != decodedUser.userId) {
                    throw new AuthFailureError('UserId mismatch!!');
                }
                req.user = decodedUser
                req.refreshToken = refreshToken
                return next();

            } catch (error: any) {
                throw error;
            }
        }

        const accessToken = getTokenFromHeader(req.headers[HEADER.AUTHORIZATION]);
        const cleanToken = accessToken.startsWith('Bearer ')
            ? accessToken.split(' ')[1]
            : accessToken;



        try {
            const decodedUser = jwt.verify(cleanToken, key.publicKey) as DecodedUser;
            if (userId !== decodedUser.userId) throw new AuthFailureError('Invalid userId');

            req.user = decodedUser;
            return next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                throw new AuthFailureError('Token expired');
            }
            if (error instanceof jwt.JsonWebTokenError) {
                throw new AuthFailureError('Invalid token');
            }
            throw error;
        }
    } catch (error: any) {
        logger.error('Authentication process error', {
            context: 'USER_AUTHENTICATION_ERROR',
            metadata: {
                errorMessage: error.message
            }
        });
        throw error;
    }

})

export {
    createTokenPair,
    authentication
};