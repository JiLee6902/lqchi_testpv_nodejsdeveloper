import { AuthFailureError, BadRequestError, NotFoundError } from "../core/error.response.js"
import { createUser, findUser } from "../models/repo/user.repo.js"
import crypto from 'crypto'
import keyTokenService from "./keyToken.service.js"
import { convertToObjectId, getInfo } from "../utils/index.js"
import { createTokenPair } from "../auth/authUtils.js"
import bcrypt from 'bcryptjs';
import { KeyToken, IKeyToken } from "../models/keytoken.model.js"
import logger from "../logger/logger.js"




class AccessService {
    static async signUpUser({
        usr_username,
        usr_fullname,
        usr_email,
        usr_password,
        usr_avatar
    }: {
        usr_username: string,
        usr_fullname: string,
        usr_email: string,
        usr_password: string,
        usr_avatar: string
    }) {
        try {
            const existUser = await findUser({ usr_username })
            if (existUser) {
                throw new BadRequestError('Error: Account already registered!')
            }

            const newUser = await createUser({
                usr_username,
                usr_fullname,
                usr_email,
                usr_password,
                usr_avatar
            })

            if (newUser) {
                const publicKey = crypto.randomBytes(64).toString('hex');
                const privateKey = crypto.randomBytes(64).toString('hex');

                const tokens = await createTokenPair(
                    { userId: newUser._id, username: usr_username },
                    publicKey,
                    privateKey
                )

                await keyTokenService.createKeyToken({
                    userId: convertToObjectId(newUser._id),
                    publicKey,
                    privateKey,
                    refreshToken: tokens?.refreshToken
                })


                return {
                    user: getInfo({
                        fields: ['_id', 'usr_id', 'usr_username', 'usr_fullname', 'usr_avatar'],
                        object: newUser
                    }),
                    token: tokens
                }
            }
            throw new BadRequestError('Error: Cannot create user!');
        } catch (error: any) {
            logger.error('Signup process error', {
                context: 'USER_REGISTRATION_ERROR',
                metadata: {
                    username: usr_username,
                    errorMessage: error.message
                }
            });
            throw error;
        }
    }

    static async signIn({
        usr_username,
        usr_password,
    }: {
        usr_username: string,
        usr_password: string
    }) {
        try {
            const existAccount = await findUser({ usr_username })
            if (!existAccount) {
                throw new NotFoundError('Account not exist!');
            }

            if (existAccount.usr_status === 'deactive') {
                throw new AuthFailureError('Account is deactive!');
            }

            const authenPassword = await bcrypt.compare(usr_password, existAccount.usr_password)
            if (!authenPassword) throw new AuthFailureError('Authentiacaion fail!')
            console.log('Password authentication:', authenPassword);

            const publicKey = crypto.randomBytes(64).toString('hex');
            const privateKey = crypto.randomBytes(64).toString('hex');

            const tokens = await createTokenPair(
                { userId: existAccount._id, username: usr_username },
                publicKey,
                privateKey
            )

            await keyTokenService.createKeyToken({
                userId: convertToObjectId(existAccount._id),
                publicKey,
                privateKey,
                refreshToken: tokens?.refreshToken
            })

            return {
                user: getInfo({
                    fields: ['_id', 'usr_id', 'usr_username', 'usr_fullname', 'usr_avatar'],
                    object: existAccount
                }),
                token: tokens
            }
        } catch (error: any) {
            logger.error('Login process error', {
                context: 'USER_LOGIN_ERROR',
                metadata: {
                    username: usr_username,
                    errorMessage: error.message
                }
            });
            throw error;
        }
    }

    static logout = async (keyToken: IKeyToken) => {
        try {
            const filter = { _id: keyToken._id };
            const update = { isActive: false };
            const options = { new: true };
            await KeyToken.findOneAndUpdate(filter, update, options);
            const delKey = await keyTokenService.removeKey(keyToken._id)
            return delKey;
        } catch (error) {
            console.error("Logout error!")
        }
    }

    static handleRefreshToken = async (
        {
            keyToken,
            user,
            refreshToken
        }: {
            keyToken: IKeyToken,
            user: Record<string, any>,
            refreshToken: string
        }
    ) => {
        const { userId, username } = user;
        if (!keyToken.isActive) {
            throw new AuthFailureError("KeyToken is invalid!")
        }

        if (keyToken.refreshToken !== refreshToken) throw new AuthFailureError('Your account is having problems. Please log in again!')
        const foundUser = await findUser({
            usr_username: username
        })
        if (!foundUser) throw new AuthFailureError('This account is not exist!');

        const publicKey = crypto.randomBytes(64).toString('hex');
        const privateKey = crypto.randomBytes(64).toString('hex');
        const tokens = await createTokenPair(
            { userId: foundUser._id, username: foundUser.usr_username },
            publicKey,
            privateKey
        )

        await keyToken.updateOne({
            $set: {
                refreshToken: tokens.refreshToken,
                publicKey: publicKey,
                privateKey: privateKey
            },
            $addToSet: {
                refreshTokensUsed: refreshToken
            }
        })

        return {
            user,
            tokens
        }
    }
}

export default AccessService;