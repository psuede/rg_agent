import { logger } from './logger.js';
import { getRedisConnection } from "./db/redismanager.js";
import { config } from './config/config.js';
import { agentRouter } from './agentrouter.js';

let redis = await getRedisConnection();

let redisPublisher = redis.duplicate();
redisPublisher.on('error', err => logger.error(err));
redisPublisher.connect();

await redis.subscribe(config.RG_EVENT_KEY, async (message) => {

  if (message != null) {
    try {
      await agentRouter(JSON.parse(message), redisPublisher);
    } catch (err) {
      logger.error("RG Agent redis. Error parsing json on message: " + message);
      logger.error(err)
    }
  }
});

