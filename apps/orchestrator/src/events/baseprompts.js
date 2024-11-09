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

export const LOCK_PROMPTS = [
  {
    maxAmount : 50000,
    chanceOfReplying: 100,
    prompts: [
      "Very small wallet, why bother my time with this?",
      "Not many tokens that will be locked, you bother me for that?"
    ]
  },
  {
    maxAmount : 100000,
    chanceOfReplying: 100,
    prompts: [
      "Very small wallet, why bother my time with this?",
      "Not many tokens that will be locked, you bother me for that?"
    ]
  },
  {
    maxAmount : 250000,
    chanceOfReplying: 100,
    prompts: [
      "Small wallet, are you serious?",
      "Small one, I hope bigger ones will come soon."
    ]
  },
  {
    maxAmount : 500000,
    chanceOfReplying: 100,
    prompts: [
      "Let those tokens stay exactly where they are please. This wallet is good in terms of size, guess it's better than nothing.",
      "Those are some juicy tokens for the Reaper. Just remember to not move them, they better stay put in that wallet until the reap!"
    ]
  },
  {
    maxAmount : 1000000,
    chanceOfReplying: 100,
    prompts: [
      "This is a pretty good wallet. I would like it to join me in the realm of the Reaper forever! Dont move the tokens please! The reap will be nice.",
      "Yes not bad at all, can we start stacking those type of wallets? Let's go for the lock!"
    ]
  },
  {
    maxAmount : 2500000,
    chanceOfReplying: 100,
    prompts: [
      "Ohh sweet, that one will be good. Happy about that one. Dont move the tokens please!",
      "Not bad at all, those are the wallets we want to reap!"
    ]
  },
  {
    maxAmount : 5000000,
    chanceOfReplying: 100,
    prompts: [
      "Wow this lock will be glorious, amazing! Big wallet.",
      "Fairly big wallet, let's bring them one by one! Tokens will stack up in the Reapers realm."
    ]
  },
  {
    maxAmount : 10000000,
    chanceOfReplying: 100,
    prompts: [
      "Big wallet!!! This is what we're talking about!",
      "Wow! That's a good one, more than a million tokens to be reaped"
    ]
  },
  {
    maxAmount : 999999999,
    chanceOfReplying: 100,
    prompts: [
      "Huge, enormous wallet, the reaper is extremely euphoric about that upcoming lock!",
      "Whale wallet coming up! This is fantastic, The Reaper is over the moon about that one!"
    ]
  },
]