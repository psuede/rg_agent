import { config } from './../config/config.js';
import { post } from './../util/util.js';

/*
Expected format for the judge

{
  amount: "0.5 ETH"
}
*/

export async function manageBuy(message, redis) {
  console.log(message)
  console.log("manage buy!")
  console.log(config.RG_AGENT_AI_API_URL)

  let prompt = "<buy> Someone just bought 1 ETH of RG, which is a significant amount, what do you as the Reaper think about that?";
  let res = await post(prompt)
  if(res && res.status == 200) {
    let aiReply = await res.json();
    console.log(aiReply);
  }
  console.log("ehh")
//  console.log(res)

}