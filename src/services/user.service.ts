import { AuthFailureError, BadRequestError } from "../core/error.response.js"
import { delCacheIO, getCacheIO, setCacheIOExpiration } from "../models/repo/cache.repo.js";
import { findUser, findUserById } from "../models/repo/user.repo.js"
import { Types } from 'mongoose';
import { getInfo } from "../utils/index.js";
import userModel from "../models/user.model.js";
import { KeyToken } from "../models/keytoken.model.js";
import { sendEmailPassword } from "./email.service.js";
import bcrypt from 'bcryptjs'
import { getIORedis } from "../dbs/init.ioredis.js";

class UserService {
    static async findUserByUserId({
        user_id
    }: {
        user_id: Types.ObjectId
    }) {
        const user = await findUserById({ user_id })
        if (!user) throw new AuthFailureError("This account not exist!!");

        const usrKeyCache = `user:${user_id}`;

        setCacheIOExpiration({
            key: usrKeyCache,
            value: JSON.stringify(user),
            expirationInSeconds: 1800
        })

        return {
            user,
            toLoad: "From database"
        }
    }

    static async updateUser({
        userId, updateDataUser
    }: {
        userId: Types.ObjectId,
        updateDataUser: Record<string, any>
    }) {
        const { usr_password, ...otherData } = updateDataUser || {}
        if (usr_password) {
            throw new BadRequestError('Update information not include password!')
        }
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            otherData,
            { new: true }
        )
        if (!updatedUser) {
            throw new BadRequestError('User not found');
        }
        const usrKeyCache = `user:${updatedUser._id}`;
        if (usrKeyCache) {
            setCacheIOExpiration({
                key: usrKeyCache,
                value: JSON.stringify(updatedUser),
                expirationInSeconds: 1800
            })
        }
        return updatedUser
    }
    static async deleteUser({
        userId
    }: {
        userId: Types.ObjectId,
    }) {
        const delUser = await userModel.deleteOne({ _id: userId })

        if (delUser.deletedCount === 0) {
            throw new BadRequestError('User not found');
        }

        await KeyToken.deleteOne({ user: userId });

        return delUser
    }

    static async updateStatusUser({
        userId,
        status
    }: {
        userId: Types.ObjectId,
        status: string
    }) {
        if (!['active', 'deactive'].includes(status)) {
            throw new BadRequestError('Invalid user status');
        }

        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            { usr_status: status },
            { new: true }
        )

        if (!updatedUser) {
            throw new BadRequestError('User not found');
        }

        const type = status === 'active' ? true : false
        await KeyToken.findOneAndUpdate(
            { user: userId },
            { isActive: type },
            { new: true }
        )

        const usrKeyCache = `user:${updatedUser._id}`;
        setCacheIOExpiration({
            key: usrKeyCache,
            value: JSON.stringify(updatedUser),
            expirationInSeconds: 1800
        })
        return updatedUser
    }

    static async sendEmailToken(userId: Types.ObjectId) {
        const user = await userModel.findById(userId);
        if (!user) throw new BadRequestError("This account not exist!")

        const token = Math.random().toString().slice(2, 8)
        const keyTokenCache = `usr_token:${user._id}`
        await setCacheIOExpiration({
            key: keyTokenCache,
            value: parseInt(token),
            expirationInSeconds: 900
        })

        await sendEmailPassword({
            email: user.usr_email,
            token: parseInt(token)
        })

        return { message: 'Send token successfully!' }
    }
    static async changePassword({
        userId,
        oldPassword,
        newPassword,
        token
    }: {
        userId: Types.ObjectId,
        oldPassword: string,
        newPassword: string,
        token: number
    }) {
        const user = await userModel.findById(userId);
        if (!user) throw new BadRequestError("This account not exist!")

        const isPasswordMatch = await bcrypt.compare(oldPassword, user.usr_password);
        if (!isPasswordMatch) {
            throw new BadRequestError('OldPassword mismatch!!');
        }

        const now = new Date()
        if (user.usr_last_password_reset_request) {
            const timeLastReset = now.getTime() - user.usr_last_password_reset_request.getTime();
            if (timeLastReset < 24 * 60 * 60 * 1000) {
                throw new BadRequestError('You can only change your password after 24 hours!!');
            }
        }

        const keyTokenCache = `usr_token:${user._id}`
        const tokenCache = await getCacheIO({
            key: keyTokenCache
        })
        if (!tokenCache || parseInt(tokenCache) !== token) {
            throw new BadRequestError("Token invalid!")
        }

        user.usr_password = newPassword;
        user.usr_last_password_reset_request = now
        await user.save()

        await delCacheIO({
            key: keyTokenCache
        })

        const usrKeyCache = `user:${user._id}`;
        setCacheIOExpiration({
            key: usrKeyCache,
            value: JSON.stringify(user),
            expirationInSeconds: 1800
        })

        return {
            message: 'Change password successfully!'
        }


    }
}

export default UserService