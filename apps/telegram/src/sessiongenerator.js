import { config } from './config/config.js';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/StringSession.js';
import input from 'input';

function generateStringSession() {
  // CODE TO GENERATE A STRING SESSION
  let apiId = Number(config.TG_REAPER_API_ID);
  let apiHash = config.TG_REAPER_API_HASH;
  const stringSession = new StringSession('');
  (async () => {
    console.log("Loading interactive example...");
    const client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
    await client.start({
      phoneNumber: async () => await input.text("Please enter your number: "),
      password: async () => await input.text("Please enter your password: "),
      phoneCode: async () =>
        await input.text("Please enter the code you received: "),
      onError: (err) => console.log(err),
    });
    console.log("You should now be connected.");
    const session = client.session.save();
    console.log(session)
  })();
}

generateStringSession();