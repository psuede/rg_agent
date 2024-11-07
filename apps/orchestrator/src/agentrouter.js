
import { RG_MESSAGE_TO_REAPER, RG_BUY_BOT_MESSAGE } from "./config/eventkeys.js";
import { manageChat } from "./events/chatmanager.js";
import { manageBuy } from "./events/buymanager.js";
/*

you are here
 - make the thing start without problem
 - implement the telegram part
 - connect to postgres
 - receive messages and save to db. use one single tg connection btw!
 - do loop and send event to the agentrouter!
 // btw do we even need that agent router? maybe just to have less redis subscriptions?
 - route buy to the buy manager



*/

// subscribes to the pub/sub message bus, reacts to events coming in
// an event can be a buy, a locked wallet, a chat message from telegram
// call the buy/chat/lock managers

export async function agentRouter(message, redis) {

  if(message.event == RG_MESSAGE_TO_REAPER) {
    await manageChat(message, redis);
  } else if(message.event == RG_BUY_BOT_MESSAGE) {
    await manageBuy(message, redis);
  }
}