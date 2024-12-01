'use strict'

import { v4 as uuidv4 } from 'uuid'
import ElasticSearchService from '../services/elastic.service.js'


interface LoggerParams {
    context?: string
    metadata?: Record<string, any>
}

class Logger {
    private commonParams(params?: LoggerParams | any[]): {
        context: string
        metadata?: Record<string, any>
    } {
        let context, metadata;

        if (params && typeof params === 'object' && !Array.isArray(params)) {
            context = params.context;
            metadata = params.metadata;
        } else if (Array.isArray(params)) {
            [context, metadata] = params;
        }

        return {
            context: context,
            metadata
        };
    }

    private async logToElasticsearch(level: string, message: string, params?: LoggerParams | any[]) {
        try {
            const { context, metadata } = this.commonParams(params)

            const elasticService = await ElasticSearchService.init();

            await elasticService.addNewLog({
                timestamp: new Date(),
                level,
                message,
                context,
                metadata
            });
        } catch (error) {
            console.error('Failed to log:', error)
        }
    }
    log(message: string, params?: LoggerParams | any[]) {
        this.logToElasticsearch('info', message, params)
    }

    error(message: string, params?: LoggerParams | any[]) {
        this.logToElasticsearch('error', message, params)
    }
}

export default new Logger()