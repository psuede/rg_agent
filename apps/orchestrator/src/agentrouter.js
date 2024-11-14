import { logger } from './logger.js';
import { RG_MESSAGE_TO_REAPER, RG_BUY_BOT_MESSAGE, RG_LOCK_MESSAGE, RG_NEW_TWEET, RG_AI_START, RG_AI_STOP, RG_X_START, RG_X_STOP } from "./config/eventkeys.js";
import { manageChat } from "./events/chatmanager.js";
import { manageBuy } from "./events/buymanager.js";
import { manageLock } from "./events/lockmanager.js";
import { manageTweet } from "./events/tweetmanager.js";
import { setAiActive, isAiActive, setXactive, isXactive } from "./util/util.js";

export async function agentRouter(message, redis) {

  if(message.event == RG_AI_START || message.event == RG_AI_STOP) {
    logger.info((message.event == RG_AI_START ? "Enabling" : "Stopping") + " AI agent");
    setAiActive(message.event == RG_AI_START);
    return;
  }

  if(message.event == RG_X_START || message.event == RG_X_STOP) {
    logger.info((message.event == RG_X_START ? "Enabling" : "Stopping") + " X agent");
    setXactive(message.event == RG_X_START);
    return;
  }

  if(message.event == RG_NEW_TWEET) {
    if(!isXactive()) {
      logger.info("Ignoring new tweet as the X agent is disabled");
      return;
    }
    // no start/stop mechanism for tweets, for now
    manageTweet(message, redis);
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
  }  
}