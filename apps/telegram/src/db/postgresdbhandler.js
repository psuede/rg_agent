import { config } from './../config/config.js';
import knex from 'knex'

let connectionString = 'postgres://' + config.RG_AGENT_POSTGRES_CREDENTIALS + "@" + config.RG_AGENT_POSTGRES_URL + "/" + config.RG_AGENT_POSTGRES_DATABASE;

const db = knex({
  client: 'pg',
  connection: connectionString
});

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
      SELECT tm.content, tm.messageid_reaper, tm.replyto_messageid_reaper, tm.timestamp
      FROM "TelegramMessage" tm
      WHERE messageid_reaper = ?
      UNION ALL
      SELECT m.content, m.messageid_reaper, m.replyto_messageid_reaper, m.timestamp 
      FROM "TelegramMessage" m
      INNER JOIN relationship_chain rc ON rc.replyto_messageid_reaper = m.messageid_reaper)
      SELECT messageid_reaper as messageid, content, timestamp FROM relationship_chain ORDER BY timestamp ASC`;
  let res = await db.raw(sql, [messageId]);
  return res && res.rows.length > 0 ? res.rows : null;
}

export async function getTelegramMessageEntity(messageid, entityId) {
  let sql = `SELECT * FROM "TelegramMessageEntity" WHERE messageid = ? AND entityid = ? LIMIT 1`;
  let res = await db.raw(sql, [messageid, entityId]);
  return res && res.rows.length > 0 ? res.rows[0] : null;
}

export async function markDeleted(reaperMessageId) {
  await db.raw(`UPDATE "TelegramMessage" set "deleted" = true where "messageid_reaper" = ?`, [reaperMessageId]);
}