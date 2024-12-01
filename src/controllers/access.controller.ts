'use strict'

import { Request, Response, NextFunction } from 'express';
import { CREATED, SuccessResponse } from "../core/success.response.js"
import AccessService from "../services/access.service.js"
import { AuthFailureError, BadRequestError } from '../core/error.response.js';
import { uploadImage } from '../services/upload.service.js';



class AccessController {
    static signUpUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        let avatarUrl = '';

        if (req.file) {
            const uploadFile = await uploadImage({
                file: req.file,
                folderName: 'user/avatar'
            })
            avatarUrl = uploadFile?.imageURL || ''
        }
        const payload = {
            usr_username: req.body.usr_username,
            usr_fullname: req.body.usr_fullname,
            usr_email: req.body.usr_email,
            usr_password: req.body.usr_password,
            usr_avatar: avatarUrl
        }

        new CREATED({
            message: 'SignUp Account OK!',
            metadata: await AccessService.signUpUser(payload),
        }).send(res)
    }

    static signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        new SuccessResponse({
            message: 'Login Account successfully!',
            metadata: await AccessService.signIn(req.body),
        }).send(res)
    }

    static logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.keyStore) {
            throw new AuthFailureError('Key store not found');
        }

        new SuccessResponse({
            message: 'Logout success',
            metadata: await AccessService.logout(req.keyStore)
        }).send(res);
    }

    static handleRefreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.keyStore || !req.user || !req.refreshToken) {
            throw new BadRequestError('Request missing!');
        }

        new SuccessResponse({
            message: 'Get token successfully!',
            metadata: await AccessService.handleRefreshToken({
                refreshToken: req.refreshToken,
                user: req.user,
                keyToken: req.keyStore
            }),
        }).send(res)
    }
}

export default AccessController