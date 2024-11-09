
import { config } from './../config/config.js';
import { RG_SEND_TG } from './../config/eventkeys.js';
import { post } from './../util/util.js';

/*
Expected format for the judge
{
  wallet: 0xAbc,
  numtokens: 100000,
  valueeth: 0.5,
  valueusd: 1000,
  block: 12345
}
*/

export async function manageLock(msg, redis) {

  // next step: prompt differentiation depending on amounts, general framework for that!
  let prompt = `Someone just locked ${msg.rg} RG tokens forever, which is a significant amount, what do you as the Reaper think about that?`;
  let res = await post(prompt);
  if(res) {
    await redis.publish(config.RG_EVENT_KEY, JSON.stringify(
      { event: RG_SEND_TG, 
        message: res.message,
        replyTo: msg.messageid
      }));
  }
}

