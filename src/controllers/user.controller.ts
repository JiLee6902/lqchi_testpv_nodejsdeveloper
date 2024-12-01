'use strict'

import { Request, Response, NextFunction } from 'express';
import { CREATED, SuccessResponse } from "../core/success.response.js"
import { AuthFailureError, BadRequestError } from '../core/error.response.js';
import UserService from '../services/user.service.js';
import { convertToObjectId } from '../utils/index.js';
import { Types } from 'mongoose';
import { updateImage } from '../services/upload.service.js';



class UserController {
    static findOneUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { user_id } = req.query;
        if (!user_id || typeof user_id !== 'string') {
            throw new Error('Invalid user_id!');
        }
        if (!Types.ObjectId.isValid(user_id)) {
            throw new BadRequestError('Invalid format!');
        }

        new SuccessResponse({
            message: 'Get user success!',
            metadata: await UserService.findUserByUserId({
                user_id: new Types.ObjectId(user_id)
            })
        }).send(res);
    }

    static updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.params.userId;
        if (!userId) {
            throw new AuthFailureError('Require Id!');
        }
        
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestError('Invalid format!');
        }

        let avatarUrl = '';
        if (req.file) {
            const uploadFile = await updateImage({
                user_id: userId,
                file: req.file,
                folderName: 'user/avatar'
            })
            avatarUrl = uploadFile?.imageURL || ''
        }
        let payload : Record<string,any> = req.file ? {...req.body, usr_avatar: avatarUrl} : {...req.body}
        
        new SuccessResponse({
            message: 'Update user account successfully!',
            metadata: await UserService.updateUser({
                userId: new Types.ObjectId(userId),
                updateDataUser: payload
            })
        }).send(res);
    }

    static deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.params.userId;
        if (!userId) {
            throw new AuthFailureError('Require Id!');
        }
        if (!Types.ObjectId.isValid(userId)) {
            throw new BadRequestError('Invalid format!');
        }
        
        new SuccessResponse({
            message: 'Delete user account successfully!',
            metadata: await UserService.deleteUser({ userId: new Types.ObjectId(userId) })
        }).send(res);
    }

    static updateUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const userId = req.params.userId;
        if (!userId) {
            throw new AuthFailureError('Require Id!');
        }
        const { usr_status } = req.body;

        new SuccessResponse({
            message: 'Update user status successfully!',
            metadata: await UserService.updateStatusUser({
                userId: new Types.ObjectId(userId),
                status: usr_status
            })
        }).send(res);
    }

    static requestEmailToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user || !req.user.userId) {
            throw new AuthFailureError('Require Id!');
        }

        new SuccessResponse({
            message: 'Send Email Token successfully!',
            metadata: await UserService.sendEmailToken(new Types.ObjectId(req.user.userId))
        }).send(res);
    }

    static changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.user || !req.user.userId) {
            throw new AuthFailureError('Require Id!');
        }

        const { oldPassword, newPassword, token } = req.body;
        console.log("REQ BODY", req.body)
        new SuccessResponse({
            message: 'Send Email Token successfully!',
            metadata: await UserService.changePassword({
                userId: new Types.ObjectId(req.user.userId),
                oldPassword,
                newPassword,
                token
            })
        }).send(res);
    }

}

export default UserController