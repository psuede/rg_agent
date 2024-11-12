import { config } from './../config/config.js';
import { logger } from './../logger.js';
import knex from 'knex'

let connectionString = 'postgres://' + config.RG_AGENT_POSTGRES_CREDENTIALS + "@" + config.RG_AGENT_POSTGRES_URL + "/" + config.RG_AGENT_POSTGRES_DATABASE;

const db = knex({
  client: 'pg',
  connection: connectionString
});

export async function addTweetIfNotExists(tweet) {
  let params = [tweet.id, nullIfEmpty(tweet.conversationId), nullIfEmpty(tweet.likes), nullIfEmpty(tweet.bookmarkCount),
    nullIfEmpty(tweet.name), nullIfEmpty(tweet.replies), nullIfEmpty(tweet.retweets), tweet.text, nullIfEmpty(tweet.userId),
    nullIfEmpty(tweet.username), nullIfEmpty(tweet.isQuoted), nullIfEmpty(tweet.isReply), nullIfEmpty(tweet.isRetweet),
    falseIfEmpty(tweet.isPin), falseIfEmpty(tweet.sensitiveContent), nullIfEmpty(tweet.timestamp), nullIfEmpty(tweet.html)
  ];
  return await db.raw(`INSERT INTO "Tweet" 
    ("tweetid","conversationid","likes","bookmarkcount","name","replies","retweets","text","userid",
    "username","isquoted","isreply","isretweet","ispin","sensitivecontent","timestamp","html") 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`, params);  
}

export async function markDeleted(reaperMessageId) {
  await db.raw(`UPDATE "TelegramMessage" set "deleted" = true where "messageid_reaper" = ?`, [reaperMessageId]);
}

function falseIfEmpty(value) {
  return value ? value : false;
}

function nullIfEmpty(value) {
  return value ? value : null;
}