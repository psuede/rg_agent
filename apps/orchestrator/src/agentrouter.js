
import { RG_MESSAGE_TO_REAPER, RG_BUY_BOT_MESSAGE, RG_LOCK_MESSAGE } from "./config/eventkeys.js";
import { manageChat } from "./events/chatmanager.js";
import { manageBuy } from "./events/buymanager.js";
import { manageLock } from "./events/lockmanager.js";



export async function agentRouter(message, redis) {

  if(message.event == RG_MESSAGE_TO_REAPER) {
    await manageChat(message, redis);
  } else if(message.event == RG_BUY_BOT_MESSAGE) {
    await manageBuy(message, redis);
  } else if(message.event == RG_LOCK_MESSAGE) {
    await manageLock(message, redis)
  }
}