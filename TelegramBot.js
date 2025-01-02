import TelegramBot from "node-telegram-bot-api";

class TelBot {
    constructor(token, desChannelId, srcChannelId) {
        this.bot = new TelegramBot(token, {polling: true})
        this.token = token;
        this.desChannelId = desChannelId;
        this.srcChannelId = srcChannelId;
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

    formatMessage(summary, tweets) {
        const tweetSources = tweets
            .map(tweet => `\n• @${tweet.author}: ${tweet.link}`)
            .join('');

        return `@${tweets[0].srcF} just followed ${tweets[0].author} \n\n ${summary}\n\n• https://x.com/${tweets[0].author}`;
    }
}

export default TelBot;