
import { connectTelegram } from "./telegramhandler.js";
import { scrape } from "./rgscraper.js";
import { getRedisConnection } from "./db/redismanager.js";

(async () => {
  try {
    let tgClient = await connectTelegram();
    let redisConnection = await getRedisConnection();
    let redisPublisher = redisConnection.duplicate();
    redisPublisher.on('error', err => console.error(err));
    redisPublisher.connect();
  
    scrape(tgClient, redisPublisher)

  } catch(err) {
    console.log(err)
  }

  
})();