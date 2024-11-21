import { config } from './../config/config.js';
import { REAPER_PERSONA_NAME, AI_STATUS_SUCCESS, getPrompt, sendPrompt } from './../util/util.js';
import { markdown as format } from "telegram-format";
import { RG_SEND_TG_TWEET_SUGGESTION } from './../config/eventkeys.js';
import { TWEET_BUCKET, addToBucket } from '../memorymanager.js';
import { TWEET_PROMPT } from './baseprompts.js'

export async function manageTweet(msg, redis) {

  let res = await sendPrompt(TWEET_PROMPT, `Someone sent the following message, do you have anything to say about it? Message: ${cleanTweet(msg.text)}`);
  if (res) {
    if(res.status == AI_STATUS_SUCCESS) {
      // todo: provide the profile name here instead of "tweeter"
      await addToBucket(TWEET_BUCKET, "tweeter", msg.text, redis);
      await addToBucket(TWEET_BUCKET, REAPER_PERSONA_NAME, res.message, redis);
    }

    let message = `${msg.url}\n\ntweet: ${msg.text}\n\nreply: ${res.message}`

    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      {
        event: RG_SEND_TG_TWEET_SUGGESTION,
        message: message,
        chatId: config.RG_TG_FEED_CHAT,
        replyTo: msg.messageid
      }));
  }

}

function cleanTweet(text) {
  // remove @ and # tags
  text = text.replace(/[@]\w+/g, "");
  // remove urls
  text = text.replace(/https?:\/\/[^\s]+/g, "");
  return text;
}