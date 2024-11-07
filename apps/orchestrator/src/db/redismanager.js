
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
        console.log("retrying " + retries)
          if (retries > 20) {
              logger.warn("Too many attempts to reconnect. Redis connection was terminated");
              return new Error("Too many retries.");
          } else {
              return retries * 500;
          }
      }
    }
  });

  redisConnection.on('error', err => logger.error('Redis Client Error', err));
  redisConnection.on('connect', async (client) => {
  });

  await redisConnection.connect();

  setInterval(function () {
    if (!redisConnection || (!redisConnection.isReady || !redisConnection.isOpen)) {
      logger.info("Trying to connect to Redis at " + url);

      try {
        redisConnection.connect();
      } catch(err) {
        logger.error("Could not connect to redis: " + err);
      }
    }
  }, 3500);

  return redisConnection;
}

