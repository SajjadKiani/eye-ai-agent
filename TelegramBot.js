import TelegramBot from "node-telegram-bot-api";
import Summarizer from "./Summarizer.js";
import TwitterScraper from "./TwitterScraper.js";
import { parseTweetsLinks } from './utils.js'

class TelBot {
    constructor(token, desChannelId, srcChannelId, username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret, githubToken) {
        this.bot = new TelegramBot(token, {polling: true})
        this.token = token;
        this.desChannelId = desChannelId;
        this.srcChannelId = srcChannelId;
        this.ts = new TwitterScraper(
            username,
            password,
            email,
            apiKey,
            apiSecretKey,
            accessToken,
            accessTokenSecret
        );
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

    // async openEyes() {
    //     try {
    //         await this.ts.auth();
    //     } catch (error) {
    //         console.error('Authentication failed:', error);
    //         throw error;
    //     }

    //     this.bot.on('channel_post', this.handleChannelPost.bind(this));
    // }

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

        return `${summary}\n\n• https://x.com/${tweets[0].author}`;
    }

    async getUserTweets(username) {
        try {
            // Get user profile first to get userId
            const profile = await this.ts.getProfile(username);
            if (!profile?.userId) {
                throw new Error('Could not find Twitter profile for ' + username);
            }
            // Get user's tweets
            const tweetsObj = await this.ts.getProfileTweets(profile.userId);
            const tweets = tweetsObj.tweets
            
            if (!tweets?.length) {
                throw new Error('No tweets found for user ' + username);
            }
            // Format tweets for summarization
            const formattedTweets = tweets.slice(0, 20).map(tweet => ({
                text: tweet.text,
                author: username,
                link: `https://twitter.com/${username}/status/${tweet.id}`
            }));

            // Get summary of tweets
            const summarized = await this.summarizer.summarize(formattedTweets.map(t => t.text));

            // Create formatted message with summary and tweet sources
            const formattedMessage = this.formatMessage(summarized, formattedTweets);
            return formattedMessage;

        } catch (error) {
            console.error('Error getting user tweets:', error);
            throw error;
        }
    }

    async handleUserTweetsCommand(msg) {
        try {
            // Extract username from command (assuming format: /gettweets username)
            const username = msg.text.split(' ')[1];
            if (!username) {
                await this.bot.sendMessage(msg.chat.id, 'Please provide a Twitter username');
                return;
            }

            const userProfile = await this.ts.getProfile(username)
            await this.sendMessage(`fetching followers for: https://x.com/${username}`);
            
            const followers = await this.ts.getProfileFollowers(userProfile.userId)
            
            for (const follower of followers.profiles.slice(0, 3)) {
                console.log('fetching: @' + follower.username);
                
                const message = await this.getUserTweets(follower.username);
                await this.sendMessage(message);
            }

        } catch (error) {
            console.error('Error handling user tweets command:', error);
            await this.bot.sendMessage(msg.chat.id, 'Error processing request: ' + error.message);
        }
    }

    async openEyes() {
        try {
            // Initialize Twitter scraper
            await this.ts.auth();
            
            // Set up command handlers
            this.bot.on('message', (msg) => {
                this.handleUserTweetsCommand(msg);
            });

            console.log('Bot is running...');
        } catch (error) {
            console.error('Error starting bot:', error);
            throw error;
        }
    }
}

export default TelBot;