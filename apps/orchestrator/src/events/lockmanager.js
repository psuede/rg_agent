
import { config } from './../config/config.js';
import { logger } from './../logger.js'
import { RG_SEND_TG } from './../config/eventkeys.js';
import { LOCK_PROMPT, LOCK_PROMPTS } from './baseprompts.js';
import { sendPrompt, getPrompt, AI_STATUS_SUCCESS } from './../util/util.js';
import { LOCK_BUCKET, addToBucket } from '../memorymanager.js';

export async function manageLock(msg, redis) {
  let prompt = getPrompt(Number(msg.rg), LOCK_PROMPTS);

  if(!prompt) { 
    return;
  }

  let res = await sendPrompt(LOCK_PROMPT, prompt);

  if (res && res.status == AI_STATUS_SUCCESS) {
    addToBucket(LOCK_BUCKET, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      {
        event: RG_SEND_TG,
        message: res.message,
        chatId: msg.chatId,
        replyTo: msg.messageid
      }));
  }
}

