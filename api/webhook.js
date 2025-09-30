// api/webhook.js
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Make sure this is set in Vercel
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    // Get the text input from Dialogflow
    const userText = req.body.queryResult?.queryText || "Hello OpenAI!";

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: userText,
        },
      ],
    });

    const aiResponse = completion.choices[0].message.content;

    // Send the AI response back to Dialogflow
    res.json({
      fulfillmentMessages: [
        {
          text: {
            text: [aiResponse],
          },
        },
      ],
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    res.json({
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
