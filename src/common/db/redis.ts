import * as winston from 'winston';
import { createClient, RedisClient } from 'redis';
import { RedisConfig } from '../config';
import { isPresent } from '../util';

class RedisHandler {
  public redisClient: RedisClient;

  connection(redisConfig: RedisConfig) {
    try {
      this.redisClient = createClient({
        port: redisConfig.port,
        host: redisConfig.host,
        db: redisConfig.database
      });
      this.redisClient
        .on('error', (error: any) => {
          winston.error('redis connection error!' + error);
          process.exit();
        })
        .on('connect', () => {
          winston.info('redis connect on port ::' + redisConfig.port);
        });
    } catch (err) {
      winston.error('redis connection error!' + err);
      return Promise.reject();
    }
  }

  get(key: string) {
    return new Promise<string | null>((resolve, reject) => {
      this.redisClient.get(key, (error: Error | null, data: string | null) => {
        if (error) {
          reject(error);
        }
        if (isPresent(data) && data) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  }

  set(key: string, value: string, time?: number) {
    return new Promise<boolean>((resolve) => {
      this.redisClient.set(key, value, () => {
        if (isPresent(time) && time) {
          this.redisClient.expire(key, time, () => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  del(key: string): Promise<void> {
    this.redisClient.del(key);
    return Promise.resolve();
  }

  hget(key: string, field: string) {
    return new Promise<string | null>((resolve, reject) => {
      this.redisClient.hget(key, field, (error: Error | null, data: string | null) => {
        if (error) {
          reject(error);
        }
        if (isPresent(data) && data) {
          resolve(data);
        } else {
          resolve(null);
        }
      });
    });
  }

  hset(key: string, field: string, value: string, time?: number) {
    return new Promise<boolean>((resolve) => {
      this.redisClient.hset(key, field, value, () => {
        if (isPresent(time) && time) {
          this.redisClient.expire(key, time, () => {
            resolve(true);
          });
        } else {
          resolve(true);
        }
      });
    });
  }

  hdel(key: string, field: string): Promise<void> {
    this.redisClient.hdel(key, field);
    return Promise.resolve();
  }
}

export const redis = new RedisHandler();
