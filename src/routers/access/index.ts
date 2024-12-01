'use strict'

import express from 'express'
import asyncHandler from '../../helpers/asyncHandler.js'
import AccessController from '../../controllers/access.controller.js'
import { authentication } from '../../auth/authUtils.js'
import { uploadMemory } from '../../configs/multer.config.js'
import UploadController from '../../controllers/upload.controller.js'

const router = express.Router()

router.post('/user/signup', 
uploadMemory.single('avatar'),
asyncHandler(AccessController.signUpUser))

router.post('/user/signin', asyncHandler(AccessController.signIn))

router.use(authentication)

router.post('/logout', asyncHandler(AccessController.logout))
router.post('/request-refreshtoken', asyncHandler(AccessController.handleRefreshToken))


export default router;