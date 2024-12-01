'use strict';

import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const uploadMemory = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 
    }
})

export {
    uploadMemory
}