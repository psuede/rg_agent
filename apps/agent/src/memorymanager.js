
// Concept: Store the very latest up to date memory in redis
const { logger } = require('./../logger.js');
const { RG_EVENT_KEY, RG_BUY_EVENT, RG_CHAT_EVENT, RG_START_AI, RG_STOP_AI, RG_DO_REFLECTION, RG_REAP_EVENT, RG_INSTAREAP_EVENT, RG_MANUAL_NEXT_EVENT, RG_REACT_ON_NEXT } = require('./../static.js');

// short-term

let mem = {
  chatBucket: {
    maxSize: 75,
    minSize: 10,
    items: []
  },

  buyBucket: { 
    maxSize: 25,
    minSize: 5,
    items: []
  },

  lockBucket: { 
    maxSize: 25,
    minSize: 5,
    items: []
  },

  tweetBucket: { 
    maxSize: 25,
    minSize: 5,
    items: []
  },

  longterm: {
    size: 100,
    items: []
  }
}

function warmupMemory(redis) {
  // fetch from redis, store in memory
}

function addToBucket(bucket, item, redis) {
  bucket.items.push(item);
  if(bucket.items.length == bucket.size) {
    // store in long term memory !
    let summary = createSummary(bucket.items);
    mem.longterm.items.push(summary);
    bucket.items.splice(0, bucket.items.length-bucket.minSize);
  }
  // save memory to redis
}

function createSummary(items) {
  return "Summary!";
}

function manageEvent(msg, redis) {
  logger.info("memory event received: " + JSON.stringify(msg));
  if(msg.event == RG_REAP_EVENT || msg.event == RG_INSTAREAP_EVENT) {
    addToBucket(mem.lockBucket, msg, redis);
  } else if(msg.event == RG_BUY_EVENT) {
    addToBucket(mem.buyBucket, msg, redis);
  } else if(msg.event == RG_CHAT_EVENT) {
    addToBucket(mem.chatBucket, msg, redis);
  }
}

module.exports = {
  manageEvent
}