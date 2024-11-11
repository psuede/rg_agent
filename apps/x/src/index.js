import { logger } from './logger.js';
import { config } from './config/config.js';
import { Scraper } from 'agent-twitter-client';
import { promises as fs } from 'fs';
import { Cookie } from 'tough-cookie';
import { addTweetIfNotExists } from './db/postgresdbhandler.js'

const COOKIE_FILE = "./envfiles/cookies.json";
const ACCOUNTS_FILE = "./envfiles/accounts.json";
const scraper = new Scraper();
let accounts;

const WAIT_BETWEEN_ACCOUNT = 2500;

async function fetchTweets() {

  let t = await scraper.getLatestTweet('elonmusk');
  console.log(t)
  process.exit()

  const timeline = scraper.getTweets('psueded', 5);
  const tweet = await scraper.getTweetWhere(timeline, { isRetweet: false });
  console.log(tweet)
  process.exit()


  for(const account of accounts) {
    
    let tweet = await scraper.getLatestTweet(account);
    if(tweet) {
      let res = await addTweetIfNotExists(tweet);
      if(res && res.rowCount > 0) {
        console.log("tweet added !")
      } else {
        console.log("no need to add tweet")
      }
      
    }
    /*
    if(tweets) {
      for await(const tweet of tweets) {
        let res = await addTweetIfNotExists(tweet);
        console.log("yooo")
        console.log(tweet)
        console.log(res)
      }
    } */

    await new Promise(resolve => setTimeout(resolve, WAIT_BETWEEN_ACCOUNT));
  }

}

async function generateCookiesIfNeeded() {

  let generationNeeded = false;
  try {
    await fs.access(COOKIE_FILE)
  } catch(err) {
    generationNeeded = true;
  }

  if(!generationNeeded) {
    return;
  }

  logger.info("No cookies file exist, will login and generate one");

  await scraper.login(process.env.TWITTER_USERNAME, process.env.TWITTER_PASSWORD);
  let cookies = await scraper.getCookies();
  let jsonCookies = [];
  for(const cookie of cookies) {
    let jsonCookie = cookie.toJSON();
    jsonCookies.push(jsonCookie);
  }

  let cookiesStr = JSON.stringify(jsonCookies);
  await fs.writeFile(COOKIE_FILE, cookiesStr);
  logger.info("Cookies written to " + COOKIE_FILE);
}

async function readAndSetCookies() {
  const scraper = new Scraper();

  // Read cookie string from file
  const cookieString = await fs.readFile(COOKIE_FILE, 'utf8');
  let cookesBackToJson = JSON.parse(cookieString);

  let cookieArr = []
  for(const cook of cookesBackToJson) {
    cookieArr.push(Cookie.fromJSON(cook));
  }

  // Set cookies
  await scraper.setCookies(cookieArr);
  logger.info('Cookies have been set');

}

async function readAccounts() {
  
  try {
    await fs.access(ACCOUNTS_FILE)
  } catch(err) {
    logger.error("No accounts file exist, please create " + ACCOUNTS_FILE);
    process.exit();
  }

  // Read cookie string from file
  const accountsStr = await fs.readFile(ACCOUNTS_FILE, 'utf8');
  accounts = JSON.parse(accountsStr);
  logger.info("Accounts loaded");
  console.log(accounts);
}

(async()=> {
  logger.info("Starting X agent");
  await readAccounts();
  await generateCookiesIfNeeded();
  await readAndSetCookies();
  await fetchTweets();
  //await readAndSetCookies()
})()
