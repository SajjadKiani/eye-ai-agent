import TelegramBot from "node-telegram-bot-api";
import Summarizer from "./Summarizer.js";
import TwitterScraper from "./TwitterScraper.js";
import { parseTweetsLinks } from './utils.js'

class TelBot {
    constructor(token, desChannelId, srcChannelId, username, password, githubToken) {
        this.bot = new TelegramBot(token, {polling: true})
        this.token = token;
        this.desChannelId = desChannelId;
        this.srcChannelId = srcChannelId;
        this.ts = new TwitterScraper(username, password);
        this.summarizer = new Summarizer(githubToken);
    }

    async sendMessage(text) {
        if (!text || typeof text !== 'string') {
            console.warn('Invalid message text:', text);
            return;
        }

        try {
            await this.bot.sendMessage(this.desChannelId, text);
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
            throw error; // Re-throw to allow handling by caller
        }
    }

    async openEyes() {
        try {
            await this.ts.auth();
        } catch (error) {
            console.error('Authentication failed:', error);
            throw error;
        }

        this.bot.on('channel_post', this.handleChannelPost.bind(this));
    }

    isValidMessage(msg) {
        return this.srcChannelId.split("|").includes(msg.chat?.username);
    }

    extractTweetLinks(text) {
        return text.match(/https:\/\/[x|twitter]\.com\/\w+\/status\/\d+/g) || [];
    }

    async processTweetLinks(links) {
        const tweets = [];
        for (const link of links) {
            try {
                const tweetId = parseTweetsLinks(link);
                const tweet = await this.ts.getTweet(tweetId);
                if (tweet?.text) {
                    tweets.push({
                        text: tweet.text,
                        author: tweet?.username || 'Unknown',
                        link: link
                    });
                }
            } catch (error) {
                console.error('Error processing tweet:', link, error);
            }
        }
        return tweets;
    }

    async handleChannelPost(msg) {
        try {
            console.log('Received message from channel:', msg.chat.id);
            
            if (!this.isValidMessage(msg)) return;
            
            const tweetLinks = this.extractTweetLinks(msg.text);
            if (!tweetLinks.length) return;

            const tweets = await this.processTweetLinks(tweetLinks);
            if (!tweets.length) return;

            const summarized = await this.summarizer.summarize(tweets.map(t => t.text));
            
            // Create formatted message with summary, authors and links
            const formattedMessage = this.formatMessage(summarized, tweets);
            await this.sendMessage(formattedMessage);
        } catch (error) {
            console.error('Error processing channel post:', error);
        }
    }

    formatMessage(summary, tweets) {
        const tweetSources = tweets
            .map(tweet => `\n• @${tweet.author}: ${tweet.link}`)
            .join('');

        return `${summary}\n\nSources:${tweetSources}`;
    }
}

export default TelBot;