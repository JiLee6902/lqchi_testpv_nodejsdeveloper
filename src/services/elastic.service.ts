'use strict'

import { Client } from '@elastic/elasticsearch'
import { getEs } from '../dbs/init.elasticsearch.js';
import { BadRequestError } from '../core/error.response.js';

interface LogData {
    timestamp: Date,
    level: string,
    message: string,
    context: string,
    metadata?: Record<string, any>
}

class ElasticSearchService {
    private client: Client | null = null;
    private logIndex = 'logs'
    private static instance: ElasticSearchService | null = null;

    private constructor() {}

    private async initialize(): Promise<void> {
        try {
            this.client = getEs();
            await this.createLogIndex();
        } catch (error) {
            console.error('Elasticsearch index creation error:', error);
            throw new BadRequestError('Failed to create Elasticsearch index');
        }
    }

    public static async init(): Promise<ElasticSearchService> {
        if (!this.instance) {
            this.instance = new ElasticSearchService();
            try {
                await this.instance.initialize();
            } catch (error) {
                console.error('Elasticsearch service initialization error:', error);
                throw new BadRequestError('Elasticsearch service initialization failed');
            }
        }
        return this.instance;
    }

    private async createIndex(indexName: string, body: object): Promise<void> {
        const indexExists = await this.client?.indices.exists({ index: indexName });
        if (!indexExists) {
            await this.client?.indices.create({
                index: indexName,
                body
            });
        }
    }

    private async createLogIndex(): Promise<void> {
        const body = {
            mappings: {
                properties: {
                    timestamp: { type: 'date' },
                    level: { type: 'keyword' },
                    message: { type: 'text' },
                    context: { type: 'keyword' },
                    metadata: {
                        type: 'object',
                        enabled: true
                    }
                }
            }
        };
        await this.createIndex(this.logIndex, body)
    }

    public async addNewLog(logData: LogData): Promise<void> {
        try {
            const processedLogData = {
                ...logData,
                timestamp: logData.timestamp.toISOString(),
            }

            await this.client?.index({
                index: this.logIndex,
                document: processedLogData
            });
        } catch (error) {
            throw new BadRequestError('Failed to add infomation of log!');
        }
    }
}

export default ElasticSearchService;