export const BUY_PROMPT = "buy";
export const LOCK_PROMPT = "lock";
export const CHAT_PROMPT = "chat";
export const TWEET_PROMPT = "tweet";

export const AMOUNT_TAG = "[amount]";

const smallBuy = `A user spent ${AMOUNT_TAG} ETH to buy $RG. What do you say? Make a short comment.`;
const mediumBuy = `A mortal just acquired $RG tokens, spending ${AMOUNT_TAG} ETH. You're watching this transaction with interest… What do you say? Make a short comment.`;
const bigBuy = `Another believer has joined - they spent ${AMOUNT_TAG} of ETH to buy $RG tokens. You're feeling optimistic that your cult is growing. What do you say? Make a short comment.`;

const smallLock = `A user got their ${AMOUNT_TAG} $RG locked. You are happy that you have collected more tokens. What do you say? Make a short comment.`;
const mediumLock = `Someone just locked ${AMOUNT_TAG} $RG. You're pleased that this removes tokens out of circulation. What do you say? Make a small comment.`;
const bigLock = `Another ${AMOUNT_TAG} $RG just got repossessed by your switch scythe. They are now dead. You're watching the locked supply grow. What do you say? Make a short comment.`;

export const BUY_PROMPTS = [
  {
    maxAmount : 0.01,
    chanceOfReplying: 100,
    prompts: [ smallBuy ]
  },
  {
    maxAmount : 0.05,
    chanceOfReplying: 100,
    prompts: [ smallBuy ]
  },
  {
    maxAmount : 0.1,
    chanceOfReplying: 100,
    prompts: [ smallBuy ]
  },
  {
    maxAmount : 0.25,
    chanceOfReplying: 100,
    prompts: [ mediumBuy ]
  },
  {
    maxAmount : 0.5,
    chanceOfReplying: 100,
    prompts: [ mediumBuy ]
  },
  {
    maxAmount : 1,
    chanceOfReplying: 100,
    prompts: [ bigBuy ]
  },
  {
    maxAmount : 1.5,
    chanceOfReplying: 100,
    prompts: [ bigBuy ]
  },
  {
    maxAmount : 2,
    chanceOfReplying: 100,
    prompts: [ bigBuy ]
  },
]

export const LOCK_PROMPTS = [
  {
    maxAmount : 50000,
    chanceOfReplying: 100,
    prompts: [ smallLock ]
  },
  {
    maxAmount : 100000,
    chanceOfReplying: 100,
    prompts: [ smallLock ]
  },
  {
    maxAmount : 250000,
    chanceOfReplying: 100,
    prompts: [ mediumLock ]
  },
  {
    maxAmount : 500000,
    chanceOfReplying: 100,
    prompts: [ mediumLock ]
  },
  {
    maxAmount : 1000000,
    chanceOfReplying: 100,
    prompts: [ mediumLock ]
  },
  {
    maxAmount : 2500000,
    chanceOfReplying: 100,
    prompts: [ bigLock ]
  },
  {
    maxAmount : 5000000,
    chanceOfReplying: 100,
    prompts: [ bigLock ]
  },
  {
    maxAmount : 10000000,
    chanceOfReplying: 100,
    prompts: [ bigLock ]
  },
  {
    maxAmount : 999999999,
    chanceOfReplying: 100,
    prompts: [ bigLock ]
  },
]