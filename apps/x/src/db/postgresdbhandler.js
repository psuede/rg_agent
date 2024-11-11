import { config } from './../config/config.js';
import { logger } from './../logger.js';
import knex from 'knex'

let connectionString = 'postgres://' + config.RG_AGENT_POSTGRES_CREDENTIALS + "@" + config.RG_AGENT_POSTGRES_URL + "/" + config.RG_AGENT_POSTGRES_DATABASE;

const db = knex({
  client: 'pg',
  connection: connectionString
});

function falseIfEmpty(value) {
  return value ? value : false;
}

function nullIfEmpty(value) {
  return value ? value : null;
}

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


function removeQuotes(str) {
  return str.replace(/['"]/g, '');
}

function escapeString(str) {
  return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, char => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char; // Prepends a backslash to backslash, percent,
      // and double/single quotes
    }
  });
}

export async function markDeleted(reaperMessageId) {
  await db.raw(`UPDATE "TelegramMessage" set "deleted" = true where "messageid_reaper" = ?`, [reaperMessageId]);
}

function commaSeparated(arr) {
  let str = '';
  let counter = 0;
  for (const item of arr) {
    str += "'" + item + "'";
    if (++counter < (arr.length)) {
      str += ",";
    }
  }
  return str;
}