let currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV : "prod";

function get(parameter) {
  if(!parameter) {
    return null;
  }
  return parameter[currentEnvironment] ? parameter[currentEnvironment] : parameter.default;
}

/*
Template

config.NAME = {
  dev: null,
  test: null,
  prod: null,
  default: process.env.NAME
}
*/

export const config = {};

config.RG_EVENT_KEY = get({
  dev: null,
  test: "test_rg_event",
  prod: null,
  default: "rg_event"
});

config.RG_AGENT_POSTGRES_DATABASE = get({
  dev: null,
  test: null,
  prod: null,
  default: "rg_agent_db"
});

config.RG_AGENT_POSTGRES_URL = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_AGENT_POSTGRES_URL,
});

config.RG_AGENT_POSTGRES_CREDENTIALS = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_AGENT_POSTGRES_CREDENTIALS,
});

config.RG_AGENT_REDIS_URL = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_AGENT_REDIS_URL
});

config.TG_REAPER_API_STRING_SESSION = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.TG_REAPER_API_STRING_SESSION
})

config.TG_REAPER_API_ID = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.TG_REAPER_API_ID
})

config.TG_REAPER_API_HASH = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.TG_REAPER_API_HASH
})

config.RG_TG_MAIN_CHAT = get({
  dev: null,
  test: process.env.RG_TG_MAIN_CHAT_TEST,
  prod: null,
  default: process.env.RG_TG_MAIN_CHAT
})

config.TG_REAPER_ID = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.TG_REAPER_ID
})

config.BUY_BOT_ID = get({
  dev: null,
  test: process.env.RG_TG_BUY_BOT_ID_TEST,
  prod: null,
  default: process.env.RG_TG_BUY_BOT_ID
})

config.RG_TG_REAPERBOT_ID = {
  dev: null,
  test: process.env.RG_TG_REAPERBOT_ID_TEST,
  prod: null,
  default: process.env.RG_TG_REAPERBOT_ID
}