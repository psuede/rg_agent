import { logger } from './logger.js';
import { config } from './config/config.js';
import { Api } from 'telegram';
import { RG_SEND_TG, RG_SEND_TG_BUY_REACTION } from './config/eventkeys.js';
import { addTelegramMessage } from './db/postgresdbhandler.js'

export async function subscribeToChatEvent(tgClient, redis) {
  await redis.subscribe(config.RG_EVENT_KEY, async (message) => {
    manageRgEvent(JSON.parse(message), tgClient);
  });
}


async function manageRgEvent(msg, tgClient) {
  if(msg.event != RG_SEND_TG && msg.event != RG_SEND_TG_BUY_REACTION) {
    return;
  }
  /*
  if (msg.event == RG_REAPER_REACT_TO_REAP || msg.event == RG_REAPER_REACT_TO_BUY || 
    msg.event == RG_SEND_NEXT_REACT || event.event == RG_SEND_REFLECTION || msg.event == RG_SEND_REPLY) {
    msgObj = { message: event.msg }  
  } else if (msg.event == RG_DO_NEXT) {
    msgObj = { message: "/next" };
  } else if (msg.event == RG_HAPPY_REACTION || msg.event == RG_SAD_REACTION) {
    logger.info("Send reaction!");

    await tgClient.invoke(
      new Api.messages.SendReaction({
        peer: channel,
        msgId: event.replyTo,
        big: true,
        reaction: [new Api.ReactionEmoji({ emoticon: randomReaction(event.type) })],
      })
    );   
     return;
  }
     */


  try {

    /*
find a solution for test in prod, right now it sends everything 
to the main channel. find a differentiation there.. look at from where the message came?
    */
    // typing ...
    await tgClient.invoke(new Api.messages.SetTyping({ peer: msg.chatId, action: new Api.SendMessageTypingAction({}) }));
    let delay = getTypingDelay(msg.message);

    let secondTypingThreshold = 5000;
    if (delay > secondTypingThreshold) {
      await new Promise(resolve => setTimeout(resolve, secondTypingThreshold));
      delay -= secondTypingThreshold;
      tgClient.invoke(new Api.messages.SetTyping({ peer: msg.chatId, action: new Api.SendMessageTypingAction({}) }));
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    let messageSent = await tgClient.sendMessage(msg.chatId, msg);
   
    await addTelegramMessage(msg.chatId, config.TG_REAPER_ID, messageSent.message, false, Date.now(), messageSent.id, msg.replyTo);
  } catch (err) {
    logger.error(err);
  }
}

function getTypingDelay(msg) {

  let MIN_SHORT_TYPING_DELAY = 4 * 1000;
  let MAX_SHORT_TYPING_DELAY = randomNumber(6) * 1000;

  let MIN_LONG_TYPING_DELAY = 10 * 1000;
  let MAX_LONG_TYPING_DELAY = randomNumber(20) * 1000;

  return msg.length < 10 ? Math.max(MIN_SHORT_TYPING_DELAY, MAX_SHORT_TYPING_DELAY) : Math.max(MIN_LONG_TYPING_DELAY, MAX_LONG_TYPING_DELAY);

}

function randomNumber(max) {
  return Math.floor(Math.random() * (max + 1));
}



    /*
    const result = await tgClient.invoke(
      new Api.messages.GetAvailableReactions({
        hash: 0,
      })
    );
    console.log("reactions")
    console.log(result); // prints the result
    */