
// Concept: Store the very latest up to date memory in redis
import { config } from './config/config.js';
import { logger } from './logger.js';

// short-term
export const CHAT_BUCKET = {
  key: config.RG_CHAT_MEMORY_BUCKET,
  maxSize: 75,
  minSize: 10
}

export const BUY_BUCKET = {
  key: config.RG_BUY_MEMORY_BUCKET,
  maxSize: config.RG_BUY_MEMORY_BUCKET_MAX_SIZE,
  minSize: config.RG_BUY_MEMORY_BUCKET_MIN_SIZE
}

export const LOCK_BUCKET = {
  key: config.RG_LOCK_MEMORY_BUCKET,
  maxSize: 25,
  minSize: 5
}

export const TWEET_BUCKET = {
  key: config.RG_TWEET_MEMORY_BUCKET,
  maxSize: 25,
  minSize: 5
}

export const LONGTERM_MEMORY = {
  key: config.RG_LONGTERM_MEMORY_BUCKET,
  size: 100
}

export async function addToBucket(bucket, item, redis) {
  try {
    await redis.xAdd(bucket.key, '*', { output: item });
    const size = await redis.xLen(bucket.key);
    logger.info("added short term memory " + bucket.key + ", size: " + size);
    if(size >= bucket.maxSize) {
      // get the whole bucket
      const allMemories = await redis.xRange(bucket.key, '-', '+');
      saveLongTerm(allMemories);
      logger.info("Redis resetting bucket" + bucket.key);
      await redis.xTrim(bucket.key, 'MAXLEN', bucket.minSize);
    }
  } catch (err) {
    logger.error(err);
  }

}

function saveLongTerm(memories) {
  logger.info("Adding item to long term memory")
  console.log(memories);
}