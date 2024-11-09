import { config } from './../config/config.js';
import { RG_SEND_TG } from './../config/eventkeys.js';
import { post } from './../util/util.js';


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
  let prompt = `${msg.from.firstName}: ${msg.content}`;
  let res = await post(prompt);
  if(res) {
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG, 
        message: res.message,
        replyTo: msg.conversation[msg.conversation.length-1].messageid
      }));
  }
}