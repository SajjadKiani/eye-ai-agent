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
        const tweetContent = tweets.join('\n'); // Join tweets with newlines
        const response = await this.client.path("/chat/completions").post({
            body: {
                messages: [
                    { role: "system", content: "You are a helpful assistant that summarizes tweets. Provide a concise summary of the key points and themes." },
                    { role: "user", content: `Please summarize these tweets:\n${tweetContent}` }
                ],
                model: this.modelName,
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