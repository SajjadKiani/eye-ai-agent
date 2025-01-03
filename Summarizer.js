import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";


class Summarizer {
    constructor(token) {
        const endpoint = "https://models.inference.ai.azure.com"
        this.modelName = "Meta-Llama-3.1-405B-Instruct"
        this.client = new ModelClient(
            endpoint,
            new AzureKeyCredential(token)
        );
    }

    async summarize(tweets) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 10))
        const tweetContent = tweets.join('\n'); // Join tweets with newlines
        const response = await this.client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "user", content: `
                        You are a helpful assistant that summarizes cryptocurrency related tweets.
                        Adhere to the following instructions STRICTLY.

                        ### INSTRUCTIONS ###
                        - Identify and list any projects, initiatives, or specific work mentioned in the tweets.
                        - Ensure your summary is concise and brief, yet extracting all points.
                        - Ensure to use of Abbreviations of common words in cryptocurrency and the tech area, Do NOT mention the original phrase of the Abbreviation; for example, use TG instead of Telegram Group.
                        - Immediately start summarizing tweets, without any starter or footer sentence.

                        ### TWEETS ###
                        ${tweetContent}
                        ` }
                ],
                model: this.modelName,
                temperature: 0
            }
        });

        if (response.status !== "200") {
            throw response.body.error;
        }

        // Return the first summary response
        return response.body.choices[0].message.content;
    }
}

export default Summarizer;