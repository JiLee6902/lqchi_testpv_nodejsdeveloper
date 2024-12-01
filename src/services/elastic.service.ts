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

    private constructor() { }

    private async initialize(): Promise<void> {
        try {
            console.log('Attempting to get Elasticsearch client...');
            this.client = getEs();
            console.log('Elasticsearch client obtained successfully');
            
            await this.createLogIndex();
        } catch (error) {
            console.error('Elasticsearch initialization detailed error:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : 'No stack trace'
            });
            
            console.warn('Elasticsearch initialization encountered an issue');
        }
    }

    public static async init(): Promise<ElasticSearchService> {
        if (!this.instance) {
            this.instance = new ElasticSearchService();
            await this.instance.initialize();
        }
        return this.instance;
    }

    private async createIndex(indexName: string, body: object): Promise<void> {
        try {
            const indexExists = await this.client?.indices.exists({ index: indexName });
            if (!indexExists) {
                console.log(`Creating index: ${indexName}`);
                await this.client?.indices.create({
                    index: indexName,
                    body
                });
                console.log(`Index ${indexName} created successfully`);
            }
        } catch (error) {
            console.error(`Error creating index ${indexName}:`, error);
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
            console.error('Failed to add log:', error);
        }
    }
}

export default ElasticSearchService;
