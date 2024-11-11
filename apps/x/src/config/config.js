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

/*
      appKey: get(config.TWITTER_API_KEY),
      appSecret: get(config.TWITTER_API_KEY_SECRET),
      // Following access tokens are not required if you are
      // at part 1 of user-auth process (ask for a request token)
      // or if you want a app-only client (see below)
      accessToken: get(config.TWITTER_ACCESS_TOKEN),
      accessSecret: get(config.TWITTER_ACCESS_TOKEN_SECRET),
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


