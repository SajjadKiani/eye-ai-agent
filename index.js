
import dotenv from 'dotenv'
import TelBot from "./TelegramBot.js";
import TwitterScraper from './TwitterScraper.js';


dotenv.config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const email = process.env.TWITTER_EMAIL
const apiKey = process.env.TWITTER_API_KEY
const apiSecretKey = process.env.TWITTER_API_SECRET_KEY
const accessToken = process.env.TWITTER_ACCESS_TOKEN
const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET
const githubToken = process.env.GITHUB_TOKEN;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const srcChannelId = process.env.SRC_CHANNEL_USERNAME
const desChannelId = process.env.DES_CHANNEL_ID;

(async() => {

    const ts = new TwitterScraper(
        username,
        password,
        email,
        apiKey,
        apiSecretKey,
        accessToken,
        accessTokenSecret
    )

    // await ts.auth()

    // console.log(await ts.getMe());
    

    // await ts.scraper.sendTweetV2(
    //     `What's got you most hyped? Let us know! 🤖💸`,
    //     undefined,
    //     {
    //       poll: {
    //         options: [
    //           { label: 'AI Innovations 🤖' },
    //           { label: 'Crypto Craze 💸' },
    //           { label: 'Both! 🌌' },
    //           { label: 'Neither for Me 😅' },
    //         ],
    //         durationMinutes: 120, // Duration of the poll in minutes
    //       },
    //     },
    // );

    // const profile = await ts.getProfile('CJCJCJCJ_')
    // console.log(profile);
    // console.log(profile.userId);
    
    // const followers = await ts.getProfileFollowers('1460252469745782790')
    // console.log(followers);

    // const following = await ts.getProfileFollowing('1460252469745782790')
    // console.log(following);

    const bt = new TelBot(
        telegramBotToken, 
        desChannelId, 
        srcChannelId, 
        username,
        password,
        email,
        apiKey,
        apiSecretKey,
        accessToken,
        accessTokenSecret, 
        githubToken
    )
    await bt.openEyes()
    
    
    
    // try {
    //     const tb = new TelBot(telegramBotToken, desChannelId, srcChannelId, username, password, githubToken);
    //     await tb.openEyes();
    // }
    // catch (error) {
    //     console.error(error);
    // }
})()