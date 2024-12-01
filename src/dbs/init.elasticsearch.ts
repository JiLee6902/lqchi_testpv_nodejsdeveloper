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

    public async connect(host: string = 'http://localhost:9200'): Promise<Client> {
        if (this.initialized && this.client) {
            return this.client;
        }

        try {
            console.log(`Attempting to connect to Elasticsearch at ${host}`);
            const newClient = new Client({ node: host });

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

let initPromise: Promise<Client | null> | null = null;

export const initEs = async ({
    ELASTICSEARCH_IS_ENABLED,
    ELASTICSEARCH_HOST = 'http://elasticsearch:9200'
}: {
    ELASTICSEARCH_IS_ENABLED: boolean;
    ELASTICSEARCH_HOST?: string;
}): Promise<Client | null> => {
    if (!initPromise) {
        initPromise = (async () => {
            if (ELASTICSEARCH_IS_ENABLED) {
                const manager = ElasticsearchManager.getInstance();
                try {
                    return await manager.connect(ELASTICSEARCH_HOST);
                } catch (error) {
                    console.error('Elasticsearch initialization failed:', error);
                    throw error;
                }
            }
            return null;
        })();
    }
    return initPromise;
}

export const getEs = (): Client => {
    const manager = ElasticsearchManager.getInstance();
    return manager.getClient();
}