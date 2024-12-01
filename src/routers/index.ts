'use strict'

import express from 'express';
import accessRouters from './access/index.js';
import userRouters from './user/index.js';


const router = express.Router();

router.use('/v1/api/access', accessRouters)
router.use('/v1/api/user', userRouters)


export default router;