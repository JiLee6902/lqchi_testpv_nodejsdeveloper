'use strict'

import express, { NextFunction, Request, Response } from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import Database from './dbs/init.mongodb.js'
import commonRouter from './routers/index.js'
import { ErrorResponse, NotFoundError } from './core/error.response.js';
import { initIORedis } from './dbs/init.ioredis.js';
import { initEs } from './dbs/init.elasticsearch.js';
import logger from './logger/logger.js';
import ElasticSearchService from './services/elastic.service.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

Database;

try {
    await initEs({
        ELASTICSEARCH_IS_ENABLED: true
    });
    await ElasticSearchService.init();
} catch (error) {
    console.error('Failed to initialize Elasticsearch:', error);
}

await initIORedis({
    IOREDIS_IS_ENABLED: true
})
app.use('/', commonRouter)

app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new NotFoundError('Not Found');
    next(error);
});

app.use((error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500;

    logger.error('Application error', {
        context: 'APPLICATION_ERROR',
        metadata: {
            statusCode: statusCode,
            errorMessage: error.message,
            requestPath: req.path,
            requestMethod: req.method
        }
    });

    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        stack: error.stack,
        message: error.message || 'Internal Server Error'
    })
})

export default app;