import { logger } from './../logger.js'
import { config } from './../config/config.js';
import { RG_SEND_TG } from './../config/eventkeys.js';
import { AI_STATUS_SUCCESS, sendPrompt } from './../util/util.js';
import { CHAT_BUCKET, addToBucket } from '../memorymanager.js';
import { CHAT_PROMPT } from './baseprompts.js';
import { canInteract } from './../db/postgresdbhandler.js'

/*

Expected format for the judge

{
  from: psuede
  content: "Why is it the best?"
  conversation: [
    {
      from: Reaper
      to: psuede
      content: "RG is the best token ever"
    },
    {
      from: psuede
      to: Reaper
      content: "What is RG?"
    },
  ]
}

*/

export async function manageChat(msg, redis) {
  if(!await canInteract(msg.from.userId)) {
    logger.info("User not allowed to interact with the reaper");
    return;
  }

  let prompt = `${msg.content}`;
  let res = await sendPrompt(CHAT_PROMPT, prompt);
  if(res && res.status == AI_STATUS_SUCCESS) {
    await addToBucket(CHAT_BUCKET, prompt, redis);
    await addToBucket(CHAT_BUCKET, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG, 
        message: res.message,
        replyTo: msg.conversation[msg.conversation.length-1].messageid
      }));
  }
}