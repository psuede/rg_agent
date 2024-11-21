import { logger } from './../logger.js'
import { config } from './../config/config.js';
import { RG_SEND_TG } from './../config/eventkeys.js';
import { REAPER_PERSONA_NAME, AI_STATUS_SUCCESS, sendPrompt } from './../util/util.js';
import { CHAT_BUCKET, addToBucket } from '../memorymanager.js';
import { CHAT_PROMPT } from './baseprompts.js';
import { canInteract } from './../db/postgresdbhandler.js'

export async function manageChat(msg, redis) {
  // for now let all channel messages pass this point
  if(msg.chatId != config.RG_TG_FEED_CHAT && !await canInteract(msg.from.userId)) {
    logger.info("User not allowed to interact with the reaper");
    return;
  }

  // remove the @reaper tag
  let prompt = `${msg.content.replace(config.RG_REAPER_CHAT_TAG, "").trim()}`;
  let res = await sendPrompt(CHAT_PROMPT, prompt, msg.from.firstName);
  if(res && res.status == AI_STATUS_SUCCESS) {
    await addToBucket(CHAT_BUCKET, msg.from.firstName, prompt, redis);
    await addToBucket(CHAT_BUCKET, REAPER_PERSONA_NAME, res.message, redis);
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG, 
        message: res.message,
        chatId: msg.chatId,
        replyTo: msg.conversation[msg.conversation.length-1].messageid
      }));
  }
}