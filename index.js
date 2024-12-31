
import dotenv from 'dotenv'
import TelBot from "./TelegramBot.js";

dotenv.config();

const username = process.env.TWITTER_USERNAME;
const password = process.env.TWITTER_PASSWORD;
const githubToken = process.env.GITHUB_TOKEN;
const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
const srcChannelId = process.env.SRC_CHANNEL_USERNAME
const desChannelId = process.env.DES_CHANNEL_ID;

(async() => {
    try {
        const tb = new TelBot(telegramBotToken, desChannelId, srcChannelId, username, password, githubToken);
        await tb.openEyes();
    }
    catch (error) {
        console.error(error);
    }
})()