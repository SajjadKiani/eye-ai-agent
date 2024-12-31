
import TwitterScraper from "./TwitterScraper.js";
import dotenv from 'dotenv'
import { parseTweetsLinks } from "./utils.js";
import Summarizer from "./Summarizer.js";
import TelBot from "./TelegramBot.js";

dotenv.config();
const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const githubToken = process.env.GITHUB_TOKEN;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const desChannelId = process.env.DES_CHANNEL_ID;

(async() => {
    try {
        // const ts = new TwitterScraper(username, password)
        // await ts.auth()
        
        // const link = parseTweetsLinks('https://x.com/jyu_eth/status/1873462146249752915')
        // const tweet = await ts.getTweet(link)

        // const summarizer = new Summarizer(githubToken)
        // const summarized = await summarizer.summarize([tweet.text])

        // console.log('Summarized Tweet: ', summarized);

        const tb = new TelBot(telegramBotToken, 'eyeaiagent')

        await tb.getChannelText()

    }
    catch (error) {
        console.error(error);
    }
})()