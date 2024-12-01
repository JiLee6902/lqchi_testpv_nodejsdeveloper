'use strict'

import express from 'express'
import asyncHandler from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/authUtils.js'
import UserController from '../../controllers/user.controller.js'
import { readUser } from '../../middlewares/cache.middleware.js'
import { uploadMemory } from '../../configs/multer.config.js'

const router = express.Router()
router.get('/', readUser, asyncHandler(UserController.findOneUser))
router.patch('/:userId',authentication, uploadMemory.single('avatar'), asyncHandler(UserController.updateUser))
router.delete('/:userId', authentication, asyncHandler(UserController.deleteUser))
router.patch('/:userId/status', authentication, asyncHandler(UserController.updateUserStatus))
router.post('/request-email-token', authentication, asyncHandler(UserController.requestEmailToken))
router.post('/change-password', authentication, asyncHandler(UserController.changePassword))


export default router;