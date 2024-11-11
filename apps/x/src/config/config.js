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

config.RG_REAPER_X_API_KEY = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_REAPER_X_API_KEY
});

config.RG_REAPER_X_API_KEY_SECRET = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_REAPER_X_API_KEY_SECRET
});

config.RG_REAPER_X_ACCESS_TOKEN = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_REAPER_X_ACCESS_TOKEN
});

config.RG_REAPER_X_ACCESS_TOKEN_SECRET = get({
  dev: null,
  test: null,
  prod: null,
  default: process.env.RG_REAPER_X_ACCESS_TOKEN_SECRET
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

config.RG_EVENT_KEY = get({
  dev: null,
  test: "test_rg_event",
  prod: null,
  default: "rg_event"
});


