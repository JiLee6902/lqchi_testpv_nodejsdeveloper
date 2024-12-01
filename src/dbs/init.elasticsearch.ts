'use strict'

import { Client } from '@elastic/elasticsearch'

class ElasticsearchManager {
    private static instance: ElasticsearchManager;
    private client: Client | null = null;
    private initialized: boolean = false;

    private constructor() {}

    public static getInstance(): ElasticsearchManager {
        if (!this.instance) {
            this.instance = new ElasticsearchManager();
        }
        return this.instance;
    }

    public async connect(host: string = 'http://elasticsearch:9200'): Promise<Client> {
        if (this.initialized && this.client) {
            return this.client;
        }

        try {
            console.log(`Attempting to connect to Elasticsearch at ${host}`);
            const newClient = new Client({ 
                node: host,
                requestTimeout: 30000,
                maxRetries: 5,
                tls: {
                    rejectUnauthorized: false 
                }
            });

            const pingResult = await newClient.ping();
            console.log('Elasticsearch ping result:', pingResult);

            this.client = newClient;
            this.initialized = true;
            return this.client;
        } catch (error) {
            console.error('Elasticsearch connection error:', error);
            this.client = null;
            this.initialized = false;
            throw new Error(`Failed to connect to Elasticsearch: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    public getClient(): Client {
        if (!this.client || !this.initialized) {
            throw new Error('Elasticsearch client not initialized. Call connect() first.');
        }
        return this.client;
    }

    // public isInitialized(): boolean {
    //     return this.initialized;
    // }
}


export const initEs = async ({
    ELASTICSEARCH_IS_ENABLED,
    ELASTICSEARCH_HOST = 'http://elasticsearch:9200'
}: {
    ELASTICSEARCH_IS_ENABLED: boolean;
    ELASTICSEARCH_HOST?: string;
}): Promise<Client | null> => {
    if (ELASTICSEARCH_IS_ENABLED) {
        const manager = ElasticsearchManager.getInstance();
        try {
            await new Promise(resolve => setTimeout(resolve, 15000));
            return await manager.connect(ELASTICSEARCH_HOST);
        } catch (error) {
            console.error('Elasticsearch initialization failed:', error);
            return null;
        }
    }
    return null;
}

export const getEs = (): Client => {
    const manager = ElasticsearchManager.getInstance();
    return manager.getClient();
}