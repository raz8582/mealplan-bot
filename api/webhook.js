// File: api/webhook.js
import OpenAI from "openai";

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Extract the user query from Dialogflow
    const userText = req.body.queryResult?.queryText || "Hello";

    // Call OpenAI Chat API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: userText }],
    });

    const aiResponse = completion.choices[0].message.content;

    // Return response to Dialogflow
    res.status(200).json({
      fulfillmentMessages: [
        {
          text: {
            text: [aiResponse],
          },
        },
      ],
    });
  } catch (error) {
    console.error("Webhook error:", error);

    res.status(500).json({
      fulfillmentMessages: [
        {
          text: {
            text: ["Error calling OpenAI API. Check your API key and logs."],
          },
        },
      ],
    });
  }
}
