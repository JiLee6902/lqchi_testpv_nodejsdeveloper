'use strict'

import userModel from "../user.model.js";
import { Types } from 'mongoose';

/**
 * @desc: tạo user
 * @param param0 - các tham số tạo user
 * @returns - trả về user được tạo
 */
const createUser = async ({
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
}): Promise<Record<string, any> | null> => {
    try {
        const user = await userModel.create({
            usr_username,
            usr_fullname,
            usr_email,
            usr_password,
            usr_avatar
        })
        return user
    } catch (error) {
        console.error('Error creating user:', error);
        return null;
    }
}

/**
 * @desc: tìm user
 * @param param0 - username duy nhất định danh user
 * @returns - trả về user 
 */
const findUser = async ({
    usr_username
}: { usr_username: string }): Promise<Record<string, any> | null> => {
    try {
        const user = await userModel.findOne({usr_username}).lean()
        return user ?? null
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}

/**
 * @desc: tìm user by usr_id
 * @param param0 - user_id
 * @returns - trả về user 
 */
const findUserById = async ({
    user_id
}: { user_id: Types.ObjectId }): Promise<Record<string, any> | null> => {
    try {
        const user = await userModel.findById(user_id).lean()
        return user ?? null
    } catch (error) {
        console.error('Error finding user:', error);
        return null;
    }
}


export {
    createUser,
    findUser,
    findUserById
}