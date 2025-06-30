import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    if (!this.configService) {
      this.logger.warn('ConfigService is not available for Redis configuration');
    }
  }

  async onModuleInit() {
    try {
      const redisHost = this.configService?.get<string>('REDIS_HOST') || 'localhost';
      const redisPort = this.configService?.get<number>('REDIS_PORT') || 6379;
      const redisPassword = this.configService?.get<string>('REDIS_PASSWORD');

      const redisUrl = redisPassword 
        ? `redis://:${redisPassword}@${redisHost}:${redisPort}`
        : `redis://${redisHost}:${redisPort}`;
      
      this.logger.log(`Connecting to Redis at ${redisHost}:${redisPort}`);

      this.client = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
        },
      });

      this.client.on('error', (err) => {
        this.logger.error('Redis Client Error', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.logger.log('Redis client connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        this.logger.log('Redis client ready');
        this.isConnected = true;
      });

      this.client.on('end', () => {
        this.logger.log('Redis client disconnected');
        this.isConnected = false;
      });

      await this.client.connect();
      this.logger.log('Successfully connected to Redis.');
    } catch (error) {
      this.logger.error('Could not connect to Redis.', error.message);
      this.isConnected = false;
      // Redis bağlantısı olmadan da çalışmaya devam et
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      try {
        await this.client.quit();
        this.logger.log('Redis connection closed.');
      } catch (error) {
        this.logger.error('Error closing Redis connection:', error.message);
      }
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      this.logger.debug('Redis client is not connected. Cannot GET.');
      return null;
    }
    
    try {
      const value = await this.client.get(key);
      return value ? (JSON.parse(value) as T) : null;
    } catch (error) {
      this.logger.error(`Error getting key ${key} from Redis:`, error.message);
      return null;
    }
  }

  async set(key: string, value: any, ttlInSeconds?: number): Promise<void> {
    if (!this.client || !this.isConnected) {
      this.logger.debug('Redis client is not connected. Cannot SET.');
      return;
    }
    
    try {
      const stringValue = JSON.stringify(value);
      if (ttlInSeconds) {
        await this.client.set(key, stringValue, { EX: ttlInSeconds });
      } else {
        await this.client.set(key, stringValue);
      }
      this.logger.debug(`Successfully set key ${key} in Redis`);
    } catch (error) {
      this.logger.error(`Error setting key ${key} in Redis:`, error.message);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      this.logger.debug('Redis client is not connected. Cannot DELETE.');
      return;
    }
    
    try {
      await this.client.del(key);
      this.logger.debug(`Successfully deleted key ${key} from Redis`);
    } catch (error) {
      this.logger.error(`Error deleting key ${key} from Redis:`, error.message);
    }
  }

  async exists(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }
    
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key} in Redis:`, error.message);
      return false;
    }
  }
} 