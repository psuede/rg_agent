import { config } from './../config/config.js';
import { logger } from './../logger.js';

export const AI_STATUS_FAIL = "KO";
export const AI_STATUS_SUCCESS = "OK";

export async function sendPrompt(type, data) {
  let prompt = {
    user_input : data,
    prompt_type : type
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

export async function sendGenerationRequest(type) {
  try {
      // Create request to api service
      const req = await fetch(config.RG_AGENT_AI_API_URL+"/generatememory/"+type);
      return await req.json();
  } catch(err) {
      logger.error(`ERROR: ${err}`);
  }
}

export function getPrompt(amount, promptMatrix) {
  let situation;
  for(let i=0; i<promptMatrix.length; i++) {
    let promptSituation = promptMatrix[i];
    if(amount < promptSituation.maxAmount || i==(promptMatrix.length-1)) {
      situation = promptSituation;
      break;
    }
  }
  if(!situation) {
    return;
  }
  return situation.prompts[randomNumber(situation.prompts.length-1)];
}

function randomNumber(max) {
  return Math.floor(Math.random() * (max + 1));
}