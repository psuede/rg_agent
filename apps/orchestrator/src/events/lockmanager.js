
import { config } from './../config/config.js';
import { logger } from './../logger.js'
import { RG_SEND_TG } from './../config/eventkeys.js';
import { LOCK_PROMPT, LOCK_PROMPTS } from './baseprompts.js';
import { sendPrompt, getPrompt, AI_STATUS_FAIL } from './../util/util.js';
import { LOCK_BUCKET, addToBucket } from '../memorymanager.js';



/*
Expected format for the judge
{
  wallet: 0xAbc,
  numtokens: 100000,
  valueeth: 0.5,
  valueusd: 1000,
  block: 12345
}
*/

export async function manageLock(msg, redis) {
  let prompt = getPrompt(Number(msg.rg), LOCK_PROMPTS);
  let res = await sendPrompt(LOCK_PROMPT, prompt);

  if (res) {
    if(res.status == AI_STATUS_FAIL) {
      logger.warn("AI failed to provide a reply, stopping here: " + res.message);
      return;
    }

    addToBucket(LOCK_BUCKET, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      {
        event: RG_SEND_TG,
        message: res.message,
        replyTo: msg.messageid
      }));
  }
}

