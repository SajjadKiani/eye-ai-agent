import TelegramBot from "node-telegram-bot-api";


class TelBot {
    constructor(token, desChannelId, srcChannelId) {
        this.bot = new TelegramBot(token, {polling: true})
        this.token = token;
        this.desChannelId = desChannelId;
        this.srcChannelId = srcChannelId;
    }

    async sendMessage(text) {
        try {
            await this.bot.sendMessage(this.desChannelId, text);
            console.log('Message sent successfully');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    async getChannelText() {
        try {
            this.bot.on('channel_post', async (msg) => {
                console.log(msg.chat.id);
                
                if (msg.chat.id === this.srcChannelId) {
                    console.log('Received message from source channel:', msg.text);
                }
            });
        } catch (error) {
            console.error('Error getting channel text:', error);
        }
    }
}

export default TelBot;