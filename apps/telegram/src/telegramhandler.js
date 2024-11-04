import { config } from './config/config.js';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';

export async function connectTelegram() {
    const client = new TelegramClient(
      new StringSession(
        config.TG_REAPER_API_STRING_SESSION),
        Number(config.TG_REAPER_API_ID),
        config.TG_REAPER_API_HASH, 
        { connectionRetries: 5, });
    await client.start({});
    return client;
}