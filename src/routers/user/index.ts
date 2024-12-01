'use strict'

import express from 'express'
import asyncHandler from '../../helpers/asyncHandler.js'
import { authentication } from '../../auth/authUtils.js'
import UserController from '../../controllers/user.controller.js'
import { readUser } from '../../middlewares/cache.middleware.js'
import { uploadMemory } from '../../configs/multer.config.js'

const router = express.Router()

router.get('/', readUser, asyncHandler(UserController.findOneUser))
router.use(authentication)


router.patch('/:userId', uploadMemory.single('avatar'), asyncHandler(UserController.updateUser))
router.delete('/:userId', asyncHandler(UserController.deleteUser))
router.patch('/:userId/status', asyncHandler(UserController.updateUserStatus))
router.post('/request-email-token', asyncHandler(UserController.requestEmailToken))
router.post('/change-password', asyncHandler(UserController.changePassword))


export default router;