
import { connectTelegram } from "./telegramhandler.js";
import { scrape } from "./rgscraper.js";
import { getRedisConnection } from "./db/redismanager.js";
import { subscribeToChatEvent } from "./reaper.js";

(async () => {
  try {
    let tgClient = await connectTelegram();
    let redisConnection = await getRedisConnection();
    let redisPublisher = redisConnection.duplicate();
    redisPublisher.on('error', err => console.error(err));
    redisPublisher.connect();

    scrape(tgClient, redisPublisher);
    subscribeToChatEvent(tgClient, redisConnection);

  } catch (err) {
    console.log(err)
  }
})();