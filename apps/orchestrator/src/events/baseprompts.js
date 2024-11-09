export const BUY_PROMPT = "buy";
export const LOCK_PROMPT = "lock";
export const CHAT_PROMPT = "chat";
export const TWEET_PROMPT = "tweet";

export const BUY_PROMPTS = [
  {
    maxAmount : 0.01,
    chanceOfReplying: 100,
    prompts: [
      "Very small buy, why waste my time with this?",
      "What? Less than 0.01 ETH spent??? That's ridiculous, next please."
    ]
  },
  {
    maxAmount : 0.05,
    chanceOfReplying: 100,
    prompts: [
      "Small fish... Will barely bother locking that wallet.",
      "That's not much. Hope those were not your last ETH, because I'll be locking them away haha."
    ]
  },
  {
    maxAmount : 0.1,
    chanceOfReplying: 100,
    prompts: [
      "Thank you for the contribution, I wish it had been more though. Is that all the ETH you have?",
      "Not the biggest buy, but I'll take it! Those tokens will soon be mine."
    ]
  },
  {
    maxAmount : 0.25,
    chanceOfReplying: 100,
    prompts: [
      "Cool, those tokens will sit well in the realm of the Reaper. Wish it was more though.",
      "Thanks ser, keep them coming. Even if it's not the biggest amount it's better than nothing."
    ]
  },
  {
    maxAmount : 0.5,
    chanceOfReplying: 100,
    prompts: [
      "Now we're talking, these are the buys that makes the Reaper happy.",
      "You decided to join me with all those RG tokens, see you in 9 days!"
    ]
  },
  {
    maxAmount : 1,
    chanceOfReplying: 100,
    prompts: [
      "Yes this is what we're talking about. That's a big buy. The whales are joining the RG fun!?",
      "Oohh very happy about that big buy, please make sure to not wrap the tokens in that measly NFT."
    ]
  },
  {
    maxAmount : 1.5,
    chanceOfReplying: 100,
    prompts: [
      "Huge buy, this will make a big difference for the Reaper in 9 days from now. Awesome!",
      "Incredibly big buy, the Reaper is ecstatic about it!"
    ]
  },
  {
    maxAmount : 2,
    chanceOfReplying: 100,
    prompts: [
      "Mega buy just happened, the reaper is extremely euphoric! Who is behind that one?",
      "Whale sized buy! This is fantastic, The Reaper is over the moon about that one!"
    ]
  },
]