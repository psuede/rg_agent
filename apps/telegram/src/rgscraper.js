import { logger } from './logger.js';
import { NewMessage } from 'telegram/events/NewMessage.js';
import { DeletedMessage } from "telegram/events/DeletedMessage.js";
import { RG_MESSAGE_TO_REAPER, RG_BUY_BOT_MESSAGE } from "./config/eventkeys.js";
import { addTelegramMessageEntity, addTelegramUserIfNeeded, addTelegramMessage, getTelegramMessageEntity, getTelegramMessageChain, markDeleted } from './db/postgresdbhandler.js'
import { config } from './config/config.js';


const RG_CHAT_ROOMS = [
  {
    name: "RG_MainChat",
    chatId: config.RG_TG_MAIN_CHAT
  }
]

export async function scrape(tgClient, redis) {

  // listen to new messages
  tgClient.addEventHandler(async (event) => {

    let chatId = Number(event.chatId);
    if (!isPartOfGroup(chatId, RG_CHAT_ROOMS)) {
      return;
    }

    let timestamp = Date.now();
    if (event.message) {
      let message = event.message;
      let data = message.message;
      let savedMessage;
      try {
        savedMessage = await saveMessage(message, data, chatId, timestamp);
      } catch(err) {
        logger.error(err)
      }

      let sender = await message.getSender();
      let userId = Number(sender.id);
      await handleReaperChat(userId, savedMessage, redis);
      await handleBuy(userId, savedMessage, redis);

    }

  }, new NewMessage({}));

  // listen for message deletions
  tgClient.addEventHandler(async (event) => {
    // this is not perfect as we only use the message id, which could probably
    // be shared with different chats. But didnt find a common identifier between
    // chat messages and deletions (chatId vs channelId). A better solution is
    // probably possible though but this is good enough for now as collisions should
    // be relatively rare
    if (event.deletedIds > 0) {
      for (const deleted of event.deletedIds) {
        await markDeleted(deleted);
        logger.info("Message marked as deleted (#" + deleted + ")");
      }
    }
  }, new DeletedMessage({}));

}

async function handleReaperChat(senderid, message, redis) {
  // is this a message to the reaper?
  if (message && message.toReaper && senderid != config.TG_REAPER_ID) {
    await redis.publish(config.RG_EVENT_KEY, 
    JSON.stringify({event: RG_MESSAGE_TO_REAPER, ...message}));
  }
}

async function handleBuy(senderid, message, redis) {
  // is this a message to the reaper?
  if (message && senderid == config.BUY_BOT_ID) {
    let ethValue = getEthFromBuyText(message.content);
    if(ethValue) {
      await redis.publish(config.RG_EVENT_KEY, JSON.stringify({event: RG_BUY_BOT_MESSAGE, value: ethValue}));
    }
  }
}

function isPartOfGroup(id, groups) {
  let isRgGroup = false;
  for (const group of groups) {
    if (group.chatId == id) {
      isRgGroup = true;
      break;
    }
  }

  return isRgGroup;
}

async function saveMessage(message, data, chatId, timestamp) {

  let sender = await message.getSender();
  let reaperReplyTo = message.replyTo ? message.replyTo.replyToMsgId : null;
  let isBot = sender.bot;
  let userId = Number(sender.id);
  let firstName = sender.firstName;
  let lastName = sender.lastName;
  let userName = sender.username;

  if (!userName) {
    if (sender.usernames && sender.usernames > 0) {
      userName = sender.usernames[0];
    }
  }

  let isMedia = (message.media != null);
  let reaperMessageId = message.id;

  if (userId) {
    await addTelegramUserIfNeeded(userId, nullIfEmpty(userName), nullIfEmpty(firstName), nullIfEmpty(lastName), falseIfEmpty(isBot));
  }

  await addTelegramMessage(chatId, userId, data, isMedia, timestamp, reaperMessageId, reaperReplyTo);

  let toReaper = false;
  if (message.entities && message.entities.length > 0) {
    for (const entity of message.entities) {
      if (!entity.userId) {
        continue;
      }
      // is this a message to the reaper?
      toReaper |= (Number(entity.userId) == config.TG_REAPER_ID);
      await addTelegramMessageEntity(reaperMessageId, Number(entity.userId));
    }

  }

  let msgChain = await getTelegramMessageChain(reaperMessageId);
  if (msgChain && msgChain.length > 0) {
    for (const msg of msgChain) {
      let entity = await getTelegramMessageEntity(msg.messageid, config.TG_REAPER_ID);
      if (entity != null) {
        toReaper = true;
      }
    }
  }

  logger.info("New message added: " + data);
  return {
    from : {
      firstName: firstName,
      lastName: lastName,
      userName: userName
    },
    toReaper: toReaper,
    content: data,
    conversation: msgChain
  };
}

function getEthFromBuyText(str) {
  const regex = /\(([\d.]+)\s*ETH\)/i;
  const match = str.match(regex);
  if (match) {
    return !Number.isNaN(match[1]) ? Number(match[1]) : 0;
  }
  return null;
}

function falseIfEmpty(value) {
  return value ? value : false;
}

function nullIfEmpty(value) {
  return value ? value : null;
}

function removeSingleQuote(str) {
  return str.replace(/'/g, '');
}