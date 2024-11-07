import { config } from './../config/config.js';
import { logger } from './../logger.js';

export async function post(data) {
  let prompt = {
    user_input : data
  }
  try {
      // Create request to api service
      const req = await fetch(config.RG_AGENT_AI_API_URL+"/prompt/", {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(prompt),
      });
      return await req.json();
  } catch(err) {
      logger.error(`ERROR: ${err}`);
  }
}