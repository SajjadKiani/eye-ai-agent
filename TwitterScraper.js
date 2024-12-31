import fs from 'fs'
import { Scraper } from 'agent-twitter-client'

class TwitterScraper {
    constructor(username, password) {
        this.username = username
        this.password = password
        this.scraper = new Scraper()
        this.cookiesPath = 'twitter-cookies.txt'
    }

    async auth() {
        if (!this.scraper.isLoggedIn()) {
            this.scraper.login(this.username, this.password)
        }
    }

    async sendTweet (text) {
        try {
            await this.scraper.sendTweet(
                text,
                undefined,
              );
              console.log('tweet sent!');
        } catch (e) {
            console.log(e);
        }
    }

    async getTweet (tweetId) {
        try {
            const tweet = await this.scraper.getTweet(tweetId)
            return tweet
        } catch (e) {
            console.log(e);
        }
    }

    async getListTweets (listId) {
        try {
            const tweets = await this.scraper.fetchListTweets(listId)
            return tweets
        } catch (e) {
            console.log(e);
        }
    }
}

export default TwitterScraper