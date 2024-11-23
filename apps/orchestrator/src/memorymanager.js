
import { config } from './config/config.js';
import { logger } from './logger.js';
import { REAPER_PERSONA_NAME, sendGenerationRequest } from './util/util.js'
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

export async function addToBucket(bucket, name, item, redis) {
  try {
    await redis.xAdd(bucket.key, '*', { role: (name==REAPER_PERSONA_NAME ? "assistant" : "user"), content: item, name: name });
    const size = await redis.xLen(bucket.key);
    logger.info("added short term memory " + bucket.key + ", size: " + size);
    if(size >= bucket.maxSize) {
      // fetch long term memory
      logger.info("Generating long term memory for " + bucket.type);
      let longTermMemoryItem = await sendGenerationRequest(bucket.type);
      if(longTermMemoryItem.status == "KO") {
        logger.warn("AI did not generate a correct long term memory: " + longTermMemoryItem.message);
      }
      // save to redis !
      await redis.xAdd(config.RG_LONGTERM_MEMORY_BUCKET, '*', { role: "assistant", content: longTermMemoryItem.summary, name: REAPER_PERSONA_NAME });
      logger.info("Redis resetting bucket " + bucket.key);
      await redis.xTrim(bucket.key, 'MAXLEN', bucket.minSize);
    }
  } catch (err) {
    console.log(err)
    logger.error(err);
  }

}