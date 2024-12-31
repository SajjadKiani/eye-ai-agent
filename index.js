
import TwitterScraper from "./TwitterScraper.js";
import dotenv from 'dotenv'

dotenv.config();
const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;

(async() => {
    try {
        const ts = new TwitterScraper(username, password)
        await ts.auth()
        
        console.log(
            ts.getTweet('https://x.com/Defi0xJeff/status/1874012183711146080')
        )
    }
    catch (error) {
        console.error(error);
    }
})()