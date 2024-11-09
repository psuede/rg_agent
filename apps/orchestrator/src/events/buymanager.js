import { config } from './../config/config.js';
import { post } from './../util/util.js';
import { RG_SEND_TG_BUY_REACTION } from './../config/eventkeys.js';
import { BUY_PROMPT, BUY_PROMPTS } from './baseprompts.js';
import { getPrompt } from './../util/util.js';
import { BUY_BUCKET, addToBucket } from '../memorymanager.js';

/*
Expected format for the judge

{
  amount: "0.5 ETH"
}
*/

export async function manageBuy(msg, redis) {

  let prompt = getPrompt(Number(msg.value), BUY_PROMPTS);

  
  let res = await post(BUY_PROMPT, prompt)
  if(res) {
    addToBucket(BUY_BUCKET, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG_BUY_REACTION, 
        message: res.message,
        replyTo: msg.messageid
      }));
  }

}