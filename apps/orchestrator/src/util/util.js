import { config } from './../config/config.js';
import { logger } from './../logger.js';
import { AMOUNT_TAG } from './../events/baseprompts.js';

export const AI_STATUS_FAIL = "KO";
export const AI_STATUS_SUCCESS = "OK";
export const REAPER_PERSONA_NAME = "The Reaper";

let aiactive = true;
let xactive = true;

export function setAiActive(value) {
  aiactive = value;
}

export function isAiActive() {
  return aiactive;
}

export function setXactive(value) {
  xactive = value;
}

export function isXactive() {
  return xactive;
}

export async function sendPrompt(type, data, name) {
  let prompt = {
    user_input : data,
    name : name,
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

  if((randomNumber(100) > situation.chanceOfReplying)) {
    logger.info("Ignoring event due to randomness filter");
    return;
  }

  return situation.prompts[randomNumber(situation.prompts.length-1)].replace(AMOUNT_TAG, amount);
}

function randomNumber(max) {
  return Math.floor(Math.random() * (max + 1));
}