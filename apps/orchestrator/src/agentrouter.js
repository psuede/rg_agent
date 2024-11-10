
import { RG_MESSAGE_TO_REAPER, RG_BUY_BOT_MESSAGE, RG_LOCK_MESSAGE, RG_AI_START, RG_AI_STOP } from "./config/eventkeys.js";
import { manageChat } from "./events/chatmanager.js";
import { manageBuy } from "./events/buymanager.js";
import { manageLock } from "./events/lockmanager.js";
import { setAiActive, isAiActive } from "./util/util.js";

export async function agentRouter(message, redis) {

  if(message.event == RG_AI_START || message.event == RG_AI_STOP) {
    setAiActive(message.event == RG_AI_START);
    return;
  }

  if(!isAiActive()) {
    logger.info("AI not active, ignoring request");
    return;
  }

  if(message.event == RG_MESSAGE_TO_REAPER) {
    await manageChat(message, redis);
  } else if(message.event == RG_BUY_BOT_MESSAGE) {
    await manageBuy(message, redis);
  } else if(message.event == RG_LOCK_MESSAGE) {
    await manageLock(message, redis)
  } else if(message.event == RG_AI_START) {
    setAiActive(true);
  } else if(message.event == RG_AI_STOP) {
    setAiActive(false);
  }
}