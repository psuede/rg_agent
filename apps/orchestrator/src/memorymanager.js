
import { config } from './config/config.js';
import { logger } from './logger.js';
import { sendGenerationRequest } from './util/util.js'
import { CHAT_PROMPT, BUY_PROMPT, LOCK_PROMPT, TWEET_PROMPT } from './events/baseprompts.js';

export const CHAT_BUCKET = {
  type: CHAT_PROMPT,
  key: config.RG_CHAT_MEMORY_BUCKET,
  maxSize: config.RG_CHAT_MEMORY_BUCKET_MAX_SIZE, //75,
  minSize: config.RG_BUY_MEMORY_BUCKET_MIN_SIZE //10
}

export const BUY_BUCKET = {
  type: BUY_PROMPT,
  key: config.RG_BUY_MEMORY_BUCKET,
  maxSize: config.RG_BUY_MEMORY_BUCKET_MAX_SIZE,
  minSize: config.RG_BUY_MEMORY_BUCKET_MIN_SIZE
}

export const LOCK_BUCKET = {
  type: LOCK_PROMPT,
  key: config.RG_LOCK_MEMORY_BUCKET,
  maxSize: config.RG_LOCK_MEMORY_BUCKET_MAX_SIZE,
  minSize: config.RG_LOCK_MEMORY_BUCKET_MIN_SIZE
}

export const TWEET_BUCKET = {
  type: TWEET_PROMPT,
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
      // fetch long term memory
      logger.info("Generating long term memory for " + bucket.type);
      let longTermMemoryItem = await sendGenerationRequest(bucket.type);
      // save to redis !
      await redis.xAdd(config.RG_LONGTERM_MEMORY_BUCKET, '*', { output: longTermMemoryItem.summary });
      logger.info("Redis resetting bucket " + bucket.key);
      await redis.xTrim(bucket.key, 'MAXLEN', bucket.minSize);
    }
  } catch (err) {
    logger.error(err);
  }

}