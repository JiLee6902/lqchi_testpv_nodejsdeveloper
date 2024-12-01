'use strict'

import { Request, Response, NextFunction } from 'express';
import { s3, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "../configs/s3.config.js";
import path from 'path';
import { getSignedUrl } from '@aws-sdk/cloudfront-signer';
import mime from 'mime-types';
import userModel from '../models/user.model.js';
interface IFile {
    file: Express.Multer.File;
    folderName?: string;
}


const generateNameFile = (orginalName: string): string => {
    const ext = path.extname(orginalName)
    const baseName = path.basename(orginalName, ext)
    const random = Math.floor(Math.random() * 10000)

    return `${baseName}-${random}${ext}`
}

const uploadImage = async ({
    file,
    folderName = 'common-file'
}: IFile) => {
    try {
        const imageName = generateNameFile(file.originalname)
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folderName}/${imageName}`,
            Body: file.buffer,
            ContentType: mime.lookup(file.originalname) || 'application/octet-stream'
        })
        await s3.send(command)
        const url = `${process.env.AWS_BUCKET_CLOUDFRONT_URL}/${folderName}/${imageName}`;

        return {
            imageURL: url
        }
    } catch (error) {
        console.error(error)
    }
}


const updateImage = async ({
    user_id,
    file,
    folderName,
}: IFile & { user_id: string }) => {
    try {
        const user = await userModel.findById(user_id)
        if (user?.usr_avatar) {
            const url = String(process.env.AWS_BUCKET_CLOUDFRONT_URL)
            const keyImage = user.usr_avatar.replace(url, "").slice(1)
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: keyImage
            }))
        }

        const imageName = generateNameFile(file.originalname)
        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${folderName}/${imageName}`,
            Body: file.buffer,
            ContentType: mime.lookup(file.originalname) || 'application/octet-stream'
        })
        await s3.send(command)
        const url = `${process.env.AWS_BUCKET_CLOUDFRONT_URL}/${folderName}/${imageName}`;

        return {
            imageURL: url
        }
    } catch (error) {
        console.error(error)
        throw error
    }
}

export {
    uploadImage,
    updateImage
}