'use strict'

import { Request, Response, NextFunction } from 'express';
import { CREATED, SuccessResponse } from "../core/success.response.js"
import { AuthFailureError, BadRequestError } from '../core/error.response.js';
import { uploadImage } from '../services/upload.service.js';


class UploadController {
    static uploadFile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        if (!req.file) {
            throw new BadRequestError('File missing!');
        }
        const { file, body: { folderName } } = req
        new SuccessResponse({
            message: 'Upload file successfully!',
            metadata: await uploadImage({
                file,
                folderName: folderName || 'default-folder'
            })
        }).send(res);
    }

}

export default UploadController