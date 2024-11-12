import { logger } from './logger.js';
import { config } from './config/config.js';
import { TwitterApi } from 'twitter-api-v2';
import { addTweetIfNotExists } from './db/postgresdbhandler.js'
import { getRedisConnection } from './db/redismanager.js';
import { RG_NEW_TWEET } from './config/eventkeys.js'

const GENERIC_TWEET_URL = "https://x.com/user/status/"

let twitterClient = new TwitterApi({
  appKey: config.RG_REAPER_X_API_KEY,
  appSecret: config.RG_REAPER_X_API_KEY_SECRET,
  accessToken: config.RG_REAPER_X_ACCESS_TOKEN,
  accessSecret: config.RG_REAPER_X_ACCESS_TOKEN_SECRET,
});

let redisConnection = await getRedisConnection();

const WAIT_BETWEEN_EVENTS = 5000;
const TWEET_FETCH_HOUR_INTERVAL = 2; // once every 2 hours
const SEARCH_QUERY = "@reapers_gambit";

async function fetchTweets() {
  
  try {
    const tweets = await twitterClient.v2.search(SEARCH_QUERY, { max_results: 10 });
    if(tweets) {
      for(const tweet of tweets) {
        let res = await addTweetIfNotExists(tweet);
        if(res && res.rowCount > 0) {
          logger.info("New tweet added: " + tweet.text);
          await redisConnection.publish(config.RG_EVENT_KEY, 
            JSON.stringify({event: RG_NEW_TWEET, ...tweet, url: (GENERIC_TWEET_URL + tweet.id)}));
          // wait a bit to not overwhelm downstream systems
          await new Promise(resolve => setTimeout(resolve, WAIT_BETWEEN_EVENTS));
        }
      }
    }
  } catch (err) {
    logger.info("Request failed " + err)
  }
}

async function fakeTweet() {
  await redisConnection.publish(config.RG_EVENT_KEY, 
    JSON.stringify({event: RG_NEW_TWEET, id: "1855571374192120128", text: "Why cant sell sir", url: (GENERIC_TWEET_URL + "1855571374192120128")}));
}

(async()=> {
  logger.info("Starting X agent, will fetch new tweets once every " + TWEET_FETCH_HOUR_INTERVAL + " hours");
  setInterval(() => { 
    logger.info("Fetching new tweets");
    fetchTweets();
  }, 1000 * 60 * 60 * TWEET_FETCH_HOUR_INTERVAL);

})()
