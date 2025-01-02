
import dotenv from 'dotenv'
import Server from './Server.js';
import { getUserAPI } from './api.js';


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
    const server = new Server(
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
    );

    try {
        await server.openEyes();
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
})()