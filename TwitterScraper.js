import fs from "fs/promises";
import { Scraper } from 'agent-twitter-client'
import path from 'path'


class TwitterScraper {
    constructor(username, password, email, apiKey, apiSecretKey, accessToken, accessTokenSecret) {
        this.username = username
        this.password = password
        this.email = email
        this.apiKey = apiKey
        this.apiSecretKey = apiSecretKey
        this.accessToken = accessToken
        this.accessTokenSecret = accessTokenSecret
        this.scraper = new Scraper()
        this.pathsCookies = path.join(
            process.cwd(),
            'cookies',
            `${username}_cookies.json`
        );
    }

    async auth() {
        const isLoggedIn = true
        // const isLoggedIn = await this.loadCookies()

        if (!isLoggedIn) {
            await this.scraper.login(
                this.username, 
                this.password,
                this.email,
                undefined,
                this.apiKey,
                this.apiSecretKey,
                this.accessToken,
                this.accessTokenSecret
            )

            await this.saveCookies()
        }
    }

    async loadCookies() {
        try {
            await fs.access(this.pathsCookies);
            const cookiesData = await fs.readFile(this.pathsCookies, 'utf-8');
            const cookies = JSON.parse(cookiesData)
            console.log(cookies);
            
            // Set all cookies at once
            await this.scraper.setCookies(cookies);
            return true;
        } catch (error) {
          console.log(`Failed to save cookies: ${error.message}`);
          return false;
        }
    }
    
    async saveCookies() {
        try {
          const cookies = await this.scraper.getCookies();
          // Create cookies directory if it doesn't exist
          await fs.mkdir(path.dirname(this.pathsCookies), { recursive: true });
          await fs.writeFile(this.pathsCookies, JSON.stringify(cookies, null, 2));
          console.log('Saved authentication cookies');
        } catch (error) {
            console.log(`Failed to save cookies: ${error.message}`);
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

    async logout () {
        try {
            await this.scraper.logout()
            console.log('logout successfully!')
        } catch (e) {
            console.log(e)
        }
    }

    async getProfileFollowers (userId) {
        try {
            const followers = this.scraper.getFollowers(userId, 10)
            return followers
        } catch (e) {
            console.log(e)
        }
    }

    async getProfileFollowing (userId) {
        try {
            const following = this.scraper.getFollowing(userId, 10)
            return following
        } catch (e) {
            console.log(e)
        }
    }

    async getProfile (user) {
        try {
            const profile = await this.scraper.getProfile(user)
            return profile
        } catch (e) {
            console.log(e)
        }
    }

    async getProfileTweets (userId) {
        try {
            const tweets = await this.scraper.getUserTweets(userId, 20)
            return tweets
        } catch (e) {
            console.log(e)
        }
    }

    async getMe () {
        try {
            const me = await this.scraper.me()
            return me
        } catch (e) {
            console.log(e)
        }
    }
}

export default TwitterScraper