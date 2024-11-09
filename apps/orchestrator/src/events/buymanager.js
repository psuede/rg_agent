import { config } from './../config/config.js';
import { AI_STATUS_FAIL, getPrompt, sendPrompt } from './../util/util.js';
import { RG_SEND_TG_BUY_REACTION } from './../config/eventkeys.js';
import { BUY_PROMPT, BUY_PROMPTS } from './baseprompts.js';
import { BUY_BUCKET, addToBucket } from '../memorymanager.js';

export async function manageBuy(msg, redis) {

  let prompt = getPrompt(Number(msg.value), BUY_PROMPTS);
  
  let res = await sendPrompt(BUY_PROMPT, prompt)
  if(res && res.status != AI_STATUS_FAIL) {
    addToBucket(BUY_BUCKET, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG_BUY_REACTION, 
        message: res.message,
        replyTo: msg.messageid
      }));
  }

}