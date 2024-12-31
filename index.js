
import TwitterScraper from "./TwitterScraper.js";
import dotenv from 'dotenv'
import { parseTweetsLinks } from "./utils.js";

dotenv.config();
const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;

(async() => {
    try {
        const ts = new TwitterScraper(username, password)
        await ts.auth()
        
        const link = parseTweetsLinks('https://x.com/jyu_eth/status/1873462146249752915')
        console.log(
            await ts.getTweet(link)
        )
    }
    catch (error) {
        console.error(error);
    }
})()