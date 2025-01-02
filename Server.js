import { createUserAPI, getUserAPI, updateUserAPI } from "./api.js";
import TelBot from "./TelegramBot.js";
import Summarizer from "./Summarizer.js"
import TwitterScraper from './TwitterScraper.js'
import Logger from './Logger.js';

class Server {
    constructor (token, desChannelId, srcChannelId, username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret, githubToken) {
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
        this.tb = new TelBot(token, desChannelId, srcChannelId)
        this.instances = []
        this.logger = new Logger({
            logDir: 'logs',
            logFile: 'server.log',
            logLevel: 'info'
        });
    }

    async handleInstance(msg, username) {
        try {
            await this.logger.info('Handling new instance', { username });
            const userProfile = await this.ts.getProfile(username);
            const following = await this.ts.getProfileFollowing(userProfile.userId)
            
            await createUserAPI({ 
                followingCount: userProfile.followingCount, 
                userId: userProfile.userId, 
                username, 
                following: following.profiles.map(f => f.username) 
            });
            
            const interval = setInterval(
                () => this.createInstance(msg, username),
                1000 * 60 * 30
            );
            this.instances.push({username, interval});
            await this.tb.bot.sendMessage(msg.chat.id, `@${username} stored to db successfully`);
            await this.logger.info('Instance created successfully', { username });
        } catch (err) {
            await this.logger.error('Failed to handle instance', { 
                username, 
                error: err.message 
            });
            await this.tb.bot.sendMessage(msg.chat.id, `Error storing user: ${err.message}`);
            throw err;
        }
    }

    async createInstance(msg, username) {
        try {
            await this.logger.debug('Creating instance', { username });
            const userProfile = await this.ts.getProfile(username);
            const dbProfile = await getUserAPI(username);
            
            if (userProfile.followingCount > dbProfile.data[0].followingCount) {
                const following = await this.ts.getProfileFollowing(userProfile.userId)

                // Get arrays of following usernames
                const currentFollowing = following.profiles.map(f => f.username);
                const previousFollowing = dbProfile.data[0].following;

                // Find new following by filtering current following that weren't in previous list
                const newFollowing = currentFollowing.filter(
                    f => !previousFollowing.includes(f)
                );

                await this.logger.info('Found new following', {
                    username,
                    newFollowing
                });
                
                for (const f of newFollowing.slice(-3)) {
                    await this.logger.info('Fetching following tweets', { 
                        targetUser: username,
                        following: f
                    });
                    
                    const message = await this.getUserTweets(username, f);
                    if (message) {
                        await this.tb.sendMessage(message);
                    }
                }

                await updateUserAPI(dbProfile.data[0].id, {
                    ...dbProfile.data[0], 
                    followingCount: userProfile.followingCount,
                    following: currentFollowing
                })
            }
        } catch (error) {
            await this.logger.error('Error in createInstance', {
                username,
                error: error.message,
                stack: error.stack
            });
            await this.tb.bot.sendMessage(msg.chat.id, 'Error processing request: ' + error.message);
        }
    }

    async getUserTweets(srcF, username) {
        try {
            await this.logger.debug('Getting user tweets', { username });
            const profile = await this.ts.getProfile(username);
            
            if (!profile?.userId) {
                await this.logger.warn('Twitter profile not found', { username });
                throw new Error('Could not find Twitter profile for ' + username);
            }
            
            const tweetsObj = await this.ts.getProfileTweets(profile.userId);
            const tweets = tweetsObj.tweets;
            
            if (!tweets?.length) {
                await this.logger.warn('No tweets found', { username });
                // throw new Error('No tweets found for user ' + username);
                return 
            } else {
                const formattedTweets = tweets.slice(0, 20).map(tweet => ({
                    srcF,
                    text: tweet.text,
                    author: username,
                    link: `https://twitter.com/${username}/status/${tweet.id}`
                }));
    
                // Get summary of tweets
                const summarized = await this.summarizer.summarize(formattedTweets.map(t => t.text));
    
                // Create formatted message with summary and tweet sources
                const formattedMessage = this.tb.formatMessage(summarized, formattedTweets);
                await this.logger.info('Successfully processed tweets', { 
                    username,
                    tweetCount: tweets.length
                });
                return formattedMessage;
            }
        } catch (error) {
            await this.logger.error('Error getting user tweets', {
                username,
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async handleAddCommand(msg) {
        try {
            // Extract username from command (assuming format: /gettweets username)
            if (msg.text.startsWith('/add')) {
                const username = msg.text.split(' ')[1];
                if (!username) {
                    await this.tb.bot.sendMessage(msg.chat.id, 'Please provide a Twitter username');
                    return;
                }
                await this.handleInstance(msg, username)
            } else {
                throw new Error('unknown command!')
            }
        } catch (error) {
            console.error('Error handling user tweets command:', error);
            await this.tb.bot.sendMessage(msg.chat.id, 'Error processing request: ' + error.message);
        }
    }

    async openEyes() {
        try {
            await this.logger.info('Starting server');
            await this.ts.auth();
            
            this.tb.bot.on('message', (msg) => {
                this.handleAddCommand(msg);
            });

            await this.logger.info('Bot is running');

            await this.logger.info('fetch User from db');

            const users = await getUserAPI();

            for (const user of users.data) {
                const interval = setInterval(
                    () => this.createInstance(msg, user.username),
                    1000 * 60 * 30
                );
                this.instances.push({username, interval});
                await this.tb.bot.sendMessage(msg.chat.id, `@${username} stored to db successfully`);
            }

            await this.logger.info('Instances created successfully');
        } catch (error) {
            await this.logger.error('Failed to start server', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}

export default Server;