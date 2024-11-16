
import { logger } from './../logger.js';
import { createClient } from 'redis';
import { config } from './../config/config.js';

let redisConnection;

export async function getRedisConnection() {
  let url = 'redis://' + config.RG_AGENT_REDIS_URL;
  redisConnection = createClient({ 
    url: url,
    pingInterval: 5000,
    socket: {
      reconnectStrategy: function(retries) {
          if (retries > 20) {
              logger.warn("Too many attempts to reconnect. Redis connection was terminated");
              return new Error("Too many retries.");
          } else {
              return retries * 500;
          }
      }
    }
  });

  redisConnection.on('error', err => { logger.error('Redis Client Error', err) });
  redisConnection.on('connect', async (client) => { logger.info("Redis connected")} );

  await redisConnection.connect();

  return redisConnection;
}

