'use strict'

import { Types } from "mongoose"
import { KeyToken, IKeyToken } from "../models/keytoken.model.js"



class keyTokenService {
    static createKeyToken = async (
        { userId, publicKey, privateKey, refreshToken }: {
            userId: Types.ObjectId;
            publicKey: string;
            privateKey: string;
            refreshToken?: string;
        }
    ) => {
        try {
            const
                filter = { user: userId },
                update = {
                    publicKey, privateKey, refreshTokensUsed: [], refreshToken
                },
                options = { upsert: true, new: true }
            const tokens = await KeyToken.findOneAndUpdate(filter, update, options)
            return tokens ? tokens.publicKey : null
        } catch (error) {
            return error;
        }
    }

    static findByUserId = async (userId: Types.ObjectId) => {
        return await KeyToken.findOne(
            {
                user: userId
            });
    }

    static removeKey = async (id: Types.ObjectId) => {
        return await KeyToken.deleteOne({
            _id: id
        })
    }

    static deleteKeyById = async (userId: Types.ObjectId) => {
        return await KeyToken.deleteOne({ user: userId })
    }
}

export default keyTokenService