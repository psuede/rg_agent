import { config } from './../config/config.js';
import { logger } from './../logger.js';
import knex from 'knex'

let connectionString = 'postgres://' + config.RG_AGENT_POSTGRES_CREDENTIALS + "@" + config.RG_AGENT_POSTGRES_URL + "/" + config.RG_AGENT_POSTGRES_DATABASE;

const db = knex({
  client: 'pg',
  connection: connectionString
});

async function addTelegramGroupsIfNeeded(groups) {
  for (const group of groups) {
    let params = [group.token, group.chatId, group.link];
    await db.raw(`INSERT INTO "TelegramGroupContract" ("tokenaddress", "groupid", "link") VALUES (?, ?, ?) ON CONFLICT DO NOTHING`, params);
  }
}

async function addSocialGroupsIfNeeded(groups) {
  for (const group of groups) {
    let params = [group.name, group.chatId, group.link];
    await db.raw(`INSERT INTO "SocialGroup" ("name", "groupid", "link") VALUES (?, ?, ?) ON CONFLICT DO NOTHING`, params);
  }
}

export async function addTelegramUserIfNeeded(userId, userName, firstName, lastName, isBot) {
  await db.raw(`INSERT INTO "TelegramUser" ("userid", "username", "firstname", "lastname", "isbot") VALUES (?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`, [userId, userName, firstName, lastName, isBot]);
}

export async function addTelegramMessage(groupId, userId, content, isMedia, timestamp, reaperMessageId, reaperReplyTo) {
  await db.raw(`INSERT INTO "TelegramMessage" ("groupid", "content", "timestamp", "media", "userid", "messageid_reaper", "replyto_messageid_reaper") VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
    [groupId, content, timestamp, isMedia, userId, reaperMessageId, reaperReplyTo]);
}

export async function addTelegramMessageEntity(messageId, entityId) {
  await db.raw(`INSERT INTO "TelegramMessageEntity" ("messageid", "entityid") VALUES (?, ?) ON CONFLICT DO NOTHING`,
    [messageId, entityId]);
}

export async function getTelegramMessageChain(messageId) {
  let sql = `WITH RECURSIVE relationship_chain AS (
    SELECT messageid_reaper, replyto_messageid_reaper 
    FROM "TelegramMessage" 
    WHERE messageid_reaper = ?
    UNION ALL
    SELECT m.messageid_reaper, m.replyto_messageid_reaper 
    FROM "TelegramMessage" m
    INNER JOIN relationship_chain rc ON rc.replyto_messageid_reaper = m.messageid_reaper)
    SELECT * FROM relationship_chain`;
  let res = await db.raw(sql, [messageId]);
  return res && res.rows.length > 0 ? res.rows : null;
}

export async function getTelegramMessageEntity(messageid, entityId) {
  let sql = `SELECT * FROM "TelegramMessageEntity" WHERE messageid = ? AND entityid = ? LIMIT 1`;
  let res = await db.raw(sql, [messageid, entityId]);
  return res && res.rows.length > 0 ? res.rows[0] : null;
}

async function addPromptMessage(timestamp, content, userid, type) {
  await db.raw(`INSERT INTO "PromptMessage" ("timestamp", "content", "userid", "type") VALUES (?, ?, ?, ?)`,
    [timestamp, content, userid, type]);
}

async function updateEmbedding(groupId, messageId, content) {
  if (content == null || content == "") {
    return;
  }
  await db.raw(`UPDATE "TelegramMessage" SET embedding = ollama_embed('nomic-embed-text', ?, _host=>'http://192.168.1.165:11434') WHERE groupid=${groupId} AND messageid=${messageId}`, [content]);
}

async function findMessageLike(str, timelimit) {
  let sql = `SELECT * FROM "TelegramMessage" WHERE timestamp > ${timelimit} AND content LIKE '${str}' ORDER BY timestamp desc LIMIT 1`;
  let res = await db.raw(sql);
  return res && res.rows.length == 1 ? res.rows[0] : null;
}

async function findLastMessagesFromUser(userId, numPastMessages) {
  let sql = `SELECT * FROM "TelegramMessage" WHERE userid = ? ORDER BY timestamp desc limit ?`;
  let res = await db.raw(sql, [userId, numPastMessages]);
  return res && res.rows.length > 0 ? res.rows : null;

}

async function findLastPromptMessagesFromUser(userId, type, numPastMessages) {
  let sql = `SELECT * FROM "PromptMessage" WHERE userid = ? ${type != null ? "AND type = '" + type + "'" : ""} ORDER BY timestamp desc limit ?`;
  let res = await db.raw(sql, [userId, numPastMessages]);
  return res && res.rows.length > 0 ? res.rows : null;
}

async function findMessageLikeFromUser(str, BUY_BOT_USERID, timelimit) {
  let sql = `SELECT * FROM "TelegramMessage" WHERE timestamp > ${timelimit} AND content LIKE '${str}' AND userid=${BUY_BOT_USERID} ORDER BY timestamp asc`;
  let res = await db.raw(sql);
  return res && res.rows.length > 0 ? res.rows : null;
}

async function getSimilarMessages(search, limit) {
  let searchStr = "'[" + search.toString() + "]'";
  let sql = `select s.name as group, t.timestamp, t.content, 
    1-(embedding <=> ${searchStr}) as similarity from "TelegramMessage" t

    inner join "SocialGroup" s on t.groupid=s.groupid
    left join "TelegramGroupContract" tg on tg.groupid=t.groupid
    where tg.groupid is null
    order by embedding
    <=> ${searchStr}
    asc limit ?
    `;
  let res = await db.raw(sql, [limit]);
  return res ? res.rows : null;
}

async function updateTelegramMessage(chatId, messageId, content) {
  await db.raw(`UPDATE "TelegramMessage" SET content=? WHERE groupid=? AND messageId=?`,
    [content, chatId, messageId])
}


async function updateTelegramMessageWithEmbedding(chatId, messageId, content) {
  await db.raw(`UPDATE "TelegramMessage" SET content=?, embedding=ollama_embed('nomic-embed-text', ?, _host=>'http://192.168.1.165:11434') WHERE groupid=? AND messageId=?`,
    [content, content, chatId, messageId])
}

async function getLatestMessages(hours) {
  let res = await db.raw(`
      SELECT s.name as group, t.timestamp, t.content from "TelegramMessage" t
      inner join "SocialGroup" s on t.groupid=s.groupid
      left join "TelegramGroupContract" tg on tg.groupid=t.groupid
      where tg.groupid is null
      ORDER BY t.timestamp ASC LIMIT 1000`);
  return res ? res.rows : null;
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